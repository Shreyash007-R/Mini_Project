from datetime import date, datetime, timedelta
from functools import wraps
import os
import re
import secrets
import uuid

import click
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint, Index, func, text, update
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash


basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))
db = SQLAlchemy()
DAILY_FINE_RATE = 5


class Book(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    isbn = db.Column(db.String(50))
    category = db.Column(db.String(100))
    publishedYear = db.Column(db.Integer)
    totalCopies = db.Column(db.Integer, default=1, nullable=False)
    availableCopies = db.Column(db.Integer, default=1, nullable=False)
    rating = db.Column(db.Float, default=0.0)
    shelfLocation = db.Column(db.String(50))
    description = db.Column(db.Text)
    coverImage = db.Column(db.String(500))

    __table_args__ = (
        CheckConstraint('totalCopies >= 0', name='ck_book_total_nonnegative'),
        CheckConstraint('availableCopies >= 0', name='ck_book_available_nonnegative'),
        CheckConstraint('availableCopies <= totalCopies', name='ck_book_available_lte_total'),
    )

    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}


class Member(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(50))
    department = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    joinDate = db.Column(db.String(50))
    status = db.Column(db.String(50), default='Active')
    borrowedCount = db.Column(db.Integer, default=0)

    def to_dict(self, borrowed_count=None):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department': self.department,
            'phone': self.phone,
            'joinDate': self.joinDate,
            'status': self.status,
            'borrowedCount': self.borrowedCount if borrowed_count is None else borrowed_count,
        }


class Transaction(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    bookId = db.Column(db.String(50), db.ForeignKey('book.id'), nullable=False)
    bookTitle = db.Column(db.String(200))
    memberId = db.Column(db.String(50), db.ForeignKey('member.id'), nullable=False)
    memberName = db.Column(db.String(100))
    issueDate = db.Column(db.String(50), nullable=False)
    dueDate = db.Column(db.String(50), nullable=False)
    returnDate = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default='Issued', nullable=False)
    fineAmount = db.Column(db.Float, default=0.0, nullable=False)
    finePaid = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        today = date.today().isoformat()
        is_active = self.returnDate is None and self.status != 'Returned'
        status = 'Overdue' if is_active and self.dueDate < today else ('Issued' if is_active else 'Returned')
        fine_amount = max(self.fineAmount or 0, calculate_fine(self.dueDate)[1]) if is_active else (self.fineAmount or 0)
        return {
            'id': self.id,
            'bookId': self.bookId,
            'bookTitle': self.bookTitle,
            'memberId': self.memberId,
            'memberName': self.memberName,
            'issueDate': self.issueDate,
            'dueDate': self.dueDate,
            'returnDate': self.returnDate,
            'status': status,
            'fineAmount': fine_amount,
            'finePaid': bool(self.finePaid),
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    passwordHash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)


class StudentAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    studentId = db.Column(db.String(50), unique=True, nullable=False)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    memberId = db.Column(db.String(50), db.ForeignKey('member.id'), unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)


class BorrowRequest(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    bookId = db.Column(db.String(50), db.ForeignKey('book.id'), nullable=False)
    memberId = db.Column(db.String(50), db.ForeignKey('member.id'), nullable=False)
    requestedAt = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='Pending', nullable=False)
    reviewedAt = db.Column(db.String(50))
    reviewedBy = db.Column(db.Integer, db.ForeignKey('user.id'))
    transactionId = db.Column(db.String(50), db.ForeignKey('transaction.id'), unique=True)

    __table_args__ = (
        Index(
            'uq_borrow_request_pending', 'bookId', 'memberId', unique=True,
            sqlite_where=text("status = 'Pending'"),
        ),
    )


class ApiError(Exception):
    def __init__(self, message, status=400):
        self.message = message
        self.status = status


def calculate_fine(due_date, end_date=None):
    due = date.fromisoformat(due_date)
    target = end_date or date.today()
    overdue_days = max(0, (target - due).days)
    return overdue_days, overdue_days * DAILY_FINE_RATE


def json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        raise ApiError('A JSON object is required.')
    return data


def required_text(data, field, maximum, label=None):
    value = data.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ApiError(f'{label or field} is required.')
    value = value.strip()
    if len(value) > maximum:
        raise ApiError(f'{label or field} must be {maximum} characters or fewer.')
    return value


def optional_text(data, field, maximum):
    value = data.get(field)
    if value is None or value == '':
        return None
    if not isinstance(value, str) or len(value.strip()) > maximum:
        raise ApiError(f'{field} must be {maximum} characters or fewer.')
    return value.strip() or None


def parse_integer(value, field, minimum, maximum):
    if isinstance(value, bool):
        raise ApiError(f'{field} must be a whole number.')
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ApiError(f'{field} must be a whole number.')
    if str(parsed) != str(value).strip() and not isinstance(value, int):
        raise ApiError(f'{field} must be a whole number.')
    if parsed < minimum or parsed > maximum:
        raise ApiError(f'{field} must be between {minimum} and {maximum}.')
    return parsed


def validate_date(value, field):
    if not isinstance(value, str):
        raise ApiError(f'{field} must be a valid date in YYYY-MM-DD format.')
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        raise ApiError(f'{field} must be a valid date in YYYY-MM-DD format.')
    if parsed.isoformat() != value:
        raise ApiError(f'{field} must be a valid date in YYYY-MM-DD format.')
    return parsed


def current_user():
    user_id = session.get('user_id')
    user = db.session.get(User, user_id) if user_id else None
    if user and user.role == 'student':
        account = StudentAccount.query.filter_by(userId=user.id).first()
        if account is None or not account.active:
            return None
    return user


def csrf_token():
    token = session.get('csrf_token')
    if not token:
        token = secrets.token_hex(32)
        session['csrf_token'] = token
    return token


def require_valid_csrf():
    if request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}:
        return
    if request.path == '/api/auth/login':
        return

    expected = session.get('csrf_token')
    received = request.headers.get('X-CSRFToken')
    if not expected or not received or received != expected:
        raise ApiError('CSRF token is missing or invalid.', 403)


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if current_user() is None:
            return jsonify({'error': 'Authentication required.'}), 401
        return view(*args, **kwargs)
    return wrapped


def staff_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user().role not in {'admin', 'librarian'}:
            return jsonify({'error': 'Administrator or librarian access is required.'}), 403
        return view(*args, **kwargs)
    return wrapped


def admin_required(view):
    @wraps(view)
    @login_required
    def wrapped(*args, **kwargs):
        if current_user().role != 'admin':
            return jsonify({'error': 'Administrator access is required.'}), 403
        return view(*args, **kwargs)
    return wrapped


def student_payload(data, account=None):
    name = required_text(data, 'name', 100, 'Full name')
    student_id = required_text(data, 'studentId', 50, 'Student ID')
    username = required_text(data, 'username', 80, 'Username')
    if len(username) < 3:
        raise ApiError('Username must be at least 3 characters long.')
    email = required_text(data, 'email', 100, 'Email').lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        raise ApiError('Enter a valid email address.')

    existing_account = StudentAccount.query.filter(
        func.lower(StudentAccount.studentId) == student_id.lower(),
        StudentAccount.id != (account.id if account else -1),
    ).first()
    if existing_account:
        raise ApiError('A student with this student ID already exists.', 409)

    existing_user = User.query.filter(
        func.lower(User.username) == username.lower(),
        User.id != (account.userId if account else -1),
    ).first()
    if existing_user:
        raise ApiError('A user with this username already exists.', 409)

    existing_email = Member.query.filter(
        func.lower(Member.email) == email,
        Member.id != (account.memberId if account else ''),
    ).first()
    if existing_email:
        raise ApiError('A member with this email already exists.', 409)

    return {'name': name, 'studentId': student_id, 'username': username, 'email': email}


def student_dict(account):
    user = db.session.get(User, account.userId)
    member = db.session.get(Member, account.memberId)
    active_count = Transaction.query.filter_by(memberId=account.memberId).filter(
        Transaction.status != 'Returned', Transaction.returnDate.is_(None)
    ).count()
    return {
        'id': account.id,
        'studentId': account.studentId,
        'memberId': account.memberId,
        'name': member.name,
        'email': member.email,
        'username': user.username,
        'active': bool(account.active),
        'borrowedCount': active_count,
    }


def book_payload(data, book=None):
    payload = {
        'title': required_text(data, 'title', 200, 'Title'),
        'author': required_text(data, 'author', 200, 'Author'),
    }
    isbn = optional_text(data, 'isbn', 50)
    if isbn and Book.query.filter(func.lower(Book.isbn) == isbn.lower(), Book.id != (book.id if book else '')).first():
        raise ApiError('A book with this ISBN already exists.', 409)
    payload['isbn'] = isbn
    for field, maximum in [('category', 100), ('shelfLocation', 50), ('description', 5000), ('coverImage', 500)]:
        payload[field] = optional_text(data, field, maximum)
    if 'publishedYear' in data and data['publishedYear'] not in (None, ''):
        payload['publishedYear'] = parse_integer(data['publishedYear'], 'Publication year', 1000, date.today().year + 1)
    if 'rating' in data:
        try:
            payload['rating'] = float(data['rating'])
        except (TypeError, ValueError):
            raise ApiError('Rating must be a number between 0 and 5.')
        if not 0 <= payload['rating'] <= 5:
            raise ApiError('Rating must be a number between 0 and 5.')
    if 'totalCopies' in data:
        payload['totalCopies'] = parse_integer(data['totalCopies'], 'Total copies', 1, 100000)
    return payload


def member_payload(data):
    name = required_text(data, 'name', 100, 'Name')
    email = required_text(data, 'email', 100, 'Email').lower()
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        raise ApiError('Enter a valid email address.')
    phone = optional_text(data, 'phone', 50)
    if phone and not re.fullmatch(r'[0-9+() .-]{5,50}', phone):
        raise ApiError('Enter a valid phone number.')
    return {
        'name': name,
        'email': email,
        'role': optional_text(data, 'role', 50) or 'Student',
        'department': optional_text(data, 'department', 100),
        'phone': phone,
    }


def member_dicts(members):
    counts = dict(db.session.query(Transaction.memberId, func.count(Transaction.id))
                  .filter(Transaction.status != 'Returned', Transaction.returnDate.is_(None))
                  .group_by(Transaction.memberId).all())
    return [member.to_dict(counts.get(member.id, 0)) for member in members]


def transaction_dicts(transactions):
    return [transaction.to_dict() for transaction in transactions]


def borrow_request_dict(borrow_request):
    book = db.session.get(Book, borrow_request.bookId)
    member = db.session.get(Member, borrow_request.memberId)
    account = StudentAccount.query.filter_by(memberId=borrow_request.memberId).first()
    return {
        'id': borrow_request.id,
        'bookId': borrow_request.bookId,
        'bookTitle': book.title if book else None,
        'memberId': borrow_request.memberId,
        'memberName': member.name if member else None,
        'studentId': account.studentId if account else None,
        'requestedAt': borrow_request.requestedAt,
        'status': borrow_request.status,
        'reviewedAt': borrow_request.reviewedAt,
        'transactionId': borrow_request.transactionId,
    }


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.environ.get('LIBROHUB_SECRET_KEY') or secrets.token_hex(32),
        SQLALCHEMY_DATABASE_URI='sqlite:///' + os.path.join(basedir, 'library.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_COOKIE_SECURE=os.environ.get('LIBROHUB_COOKIE_SECURE', 'false').lower() == 'true',
        FRONTEND_ORIGIN=os.environ.get('FRONTEND_ORIGIN', 'http://localhost:5173'),
    )
    if test_config:
        app.config.update(test_config)

    allowed_frontend_origins = sorted({
        app.config['FRONTEND_ORIGIN'].rstrip('/'),
        'http://localhost:5173',
        'http://localhost:5174',
    })

    db.init_app(app)
    CORS(app, resources={r'/api/*': {'origins': allowed_frontend_origins}}, supports_credentials=True)

    @app.before_request
    def validate_request_origin():
        if request.method == 'OPTIONS':
            return

        if request.method in {'POST', 'PUT', 'PATCH', 'DELETE'}:
            origin = request.headers.get('Origin')
            if origin and origin.rstrip('/') not in allowed_frontend_origins:
                return jsonify({'error': 'Request origin is not allowed.'}), 403
            if request.path.startswith('/api/') and request.path != '/api/auth/login':
                require_valid_csrf()

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        db.session.rollback()
        return jsonify({'error': error.message}), error.status

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        app.logger.info('Rejected conflicting database write: %s', error.orig)
        return jsonify({'error': 'The requested record conflicts with existing data.'}), 409

    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({'error': 'The requested resource was not found.'}), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        db.session.rollback()
        app.logger.exception('Unhandled API error')
        return jsonify({'error': 'An unexpected server error occurred.'}), 500

    @app.get('/api/health')
    def health():
        return jsonify({'status': 'ok'})

    @app.post('/api/auth/login')
    def login():
        data = json_body()
        username = data.get('username', '')
        password = data.get('password', '')
        if not isinstance(username, str) or not isinstance(password, str):
            raise ApiError('Username and password are required.')
        user = User.query.filter(func.lower(User.username) == username.strip().lower()).first()
        if user is None or not check_password_hash(user.passwordHash, password):
            return jsonify({'error': 'Invalid username or password.'}), 401
        if user.role == 'student':
            account = StudentAccount.query.filter_by(userId=user.id).first()
            if account is None or not account.active:
                return jsonify({'error': 'Invalid username or password.'}), 401
        session.clear()
        session['user_id'] = user.id
        session['csrf_token'] = secrets.token_hex(32)
        return jsonify({
            'user': {'id': user.id, 'username': user.username, 'role': user.role},
            'csrfToken': session['csrf_token'],
        })

    @app.post('/api/auth/logout')
    def logout():
        session.clear()
        return jsonify({'message': 'Signed out.'})

    @app.get('/api/auth/session')
    def auth_session():
        user = current_user()
        if user is None:
            session.clear()
            return jsonify({'user': None, 'csrfToken': None})
        return jsonify({
            'user': {'id': user.id, 'username': user.username, 'role': user.role},
            'csrfToken': csrf_token(),
        })

    @app.get('/api/students')
    @admin_required
    def get_students():
        accounts = StudentAccount.query.order_by(StudentAccount.studentId.asc()).all()
        return jsonify([student_dict(account) for account in accounts])

    @app.post('/api/students')
    @admin_required
    def add_student():
        data = json_body()
        payload = student_payload(data)
        password = data.get('password')
        if not isinstance(password, str) or len(password) < 12:
            raise ApiError('Initial password must be at least 12 characters long.')

        member = Member(
            id='MEM-' + uuid.uuid4().hex[:10].upper(),
            name=payload['name'],
            email=payload['email'],
            role='Student',
            joinDate=date.today().isoformat(),
            status='Active',
            borrowedCount=0,
        )
        user = User(
            username=payload['username'],
            passwordHash=generate_password_hash(password),
            role='student',
        )
        db.session.add_all([member, user])
        db.session.flush()
        account = StudentAccount(studentId=payload['studentId'], userId=user.id, memberId=member.id)
        db.session.add(account)
        db.session.commit()
        return jsonify(student_dict(account)), 201

    @app.get('/api/students/<int:student_account_id>')
    @admin_required
    def get_student(student_account_id):
        account = db.session.get(StudentAccount, student_account_id)
        if account is None:
            abort(404)
        transactions = Transaction.query.filter_by(memberId=account.memberId).order_by(
            Transaction.issueDate.desc(), Transaction.id.desc()
        ).all()
        return jsonify({**student_dict(account), 'transactions': transaction_dicts(transactions)})

    @app.put('/api/students/<int:student_account_id>')
    @admin_required
    def update_student(student_account_id):
        account = db.session.get(StudentAccount, student_account_id)
        if account is None:
            abort(404)
        payload = student_payload(json_body(), account)
        user = db.session.get(User, account.userId)
        member = db.session.get(Member, account.memberId)
        account.studentId = payload['studentId']
        user.username = payload['username']
        member.name = payload['name']
        member.email = payload['email']
        db.session.commit()
        return jsonify(student_dict(account))

    @app.patch('/api/students/<int:student_account_id>/status')
    @admin_required
    def set_student_status(student_account_id):
        account = db.session.get(StudentAccount, student_account_id)
        if account is None:
            abort(404)
        active = json_body().get('active')
        if not isinstance(active, bool):
            raise ApiError('Account status must be active or inactive.')
        account.active = active
        member = db.session.get(Member, account.memberId)
        member.status = 'Active' if active else 'Inactive'
        db.session.commit()
        return jsonify(student_dict(account))

    @app.get('/api/student/profile')
    @login_required
    def get_student_profile():
        user = current_user()
        if user.role != 'student':
            return jsonify({'error': 'Student access is required.'}), 403
        account = StudentAccount.query.filter_by(userId=user.id).first()
        if account is None:
            return jsonify({'error': 'Student account not found.'}), 404
        return jsonify(student_dict(account))

    @app.get('/api/books')
    @login_required
    def get_books():
        books = Book.query.order_by(Book.title.asc()).all()
        return jsonify([book.to_dict() for book in books])

    @app.post('/api/books')
    @staff_required
    def add_book():
        data = json_body()
        payload = book_payload(data)
        total = payload.pop('totalCopies', 1)
        book = Book(id='b-' + uuid.uuid4().hex[:16], totalCopies=total, availableCopies=total, **payload)
        db.session.add(book)
        db.session.commit()
        return jsonify(book.to_dict()), 201

    @app.put('/api/books/<string:book_id>')
    @staff_required
    def update_book(book_id):
        book = db.session.get(Book, book_id)
        if book is None:
            abort(404)
        data = json_body()
        payload = book_payload({**book.to_dict(), **data}, book)
        if 'totalCopies' in payload:
            issued = book.totalCopies - book.availableCopies
            if payload['totalCopies'] < issued:
                raise ApiError('Total copies cannot be lower than the number currently issued.')
            book.availableCopies = payload['totalCopies'] - issued
        for field, value in payload.items():
            setattr(book, field, value)
        db.session.commit()
        return jsonify(book.to_dict())

    @app.delete('/api/books/<string:book_id>')
    @staff_required
    def delete_book(book_id):
        book = db.session.get(Book, book_id)
        if book is None:
            abort(404)
        active = Transaction.query.filter_by(bookId=book_id).filter(
            Transaction.status != 'Returned', Transaction.returnDate.is_(None)).first()
        if active:
            raise ApiError('Cannot delete a book with active loans.', 409)
        if Transaction.query.filter_by(bookId=book_id).first():
            raise ApiError('Books with borrowing history cannot be deleted.', 409)
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted.'})

    @app.get('/api/members')
    @staff_required
    def get_members():
        members = Member.query.order_by(Member.name.asc()).all()
        return jsonify(member_dicts(members))

    @app.post('/api/members')
    @staff_required
    def add_member():
        data = json_body()
        payload = member_payload(data)
        member = Member(id='MEM-' + uuid.uuid4().hex[:10].upper(), joinDate=date.today().isoformat(),
                        status='Active', borrowedCount=0, **payload)
        db.session.add(member)
        db.session.commit()
        return jsonify(member.to_dict(0)), 201

    @app.put('/api/members/<string:member_id>')
    @staff_required
    def update_member(member_id):
        member = db.session.get(Member, member_id)
        if member is None:
            abort(404)
        payload = member_payload({**member.to_dict(), **json_body()})
        for field, value in payload.items():
            setattr(member, field, value)
        db.session.commit()
        return jsonify(member.to_dict())

    @app.delete('/api/members/<string:member_id>')
    @staff_required
    def delete_member(member_id):
        member = db.session.get(Member, member_id)
        if member is None:
            abort(404)
        active = Transaction.query.filter_by(memberId=member_id).filter(
            Transaction.status != 'Returned', Transaction.returnDate.is_(None)).first()
        if active:
            raise ApiError('Cannot delete a member with active loans.', 409)
        if Transaction.query.filter_by(memberId=member_id).first():
            raise ApiError('Members with borrowing history cannot be deleted.', 409)
        db.session.delete(member)
        db.session.commit()
        return jsonify({'message': 'Member deleted.'})

    @app.get('/api/transactions')
    @login_required
    def get_transactions():
        query = Transaction.query
        user = current_user()
        if user.role == 'student':
            account = StudentAccount.query.filter_by(userId=user.id).first()
            if account is None:
                return jsonify({'error': 'Student account not found.'}), 404
            query = query.filter_by(memberId=account.memberId)
        transactions = query.order_by(Transaction.issueDate.desc(), Transaction.id.desc()).all()
        return jsonify(transaction_dicts(transactions))

    @app.get('/api/borrow-requests')
    @login_required
    def get_borrow_requests():
        user = current_user()
        query = BorrowRequest.query
        if user.role not in {'admin', 'librarian'}:
            account = StudentAccount.query.filter_by(userId=user.id).first()
            if account is None:
                return jsonify({'error': 'Student account not found.'}), 404
            query = query.filter_by(memberId=account.memberId)
        requests = query.order_by(BorrowRequest.requestedAt.desc(), BorrowRequest.id.desc()).all()
        return jsonify([borrow_request_dict(item) for item in requests])

    @app.post('/api/borrow-requests')
    @login_required
    def create_borrow_request():
        user = current_user()
        if user.role != 'student':
            return jsonify({'error': 'Student access is required.'}), 403
        account = StudentAccount.query.filter_by(userId=user.id).first()
        if account is None:
            return jsonify({'error': 'Student account not found.'}), 404
        book_id = required_text(json_body(), 'bookId', 50, 'Book')
        book = db.session.get(Book, book_id)
        if book is None:
            abort(404)
        if book.availableCopies <= 0:
            raise ApiError('No copies of this book are currently available.', 409)

        active_request = BorrowRequest.query.filter(
            BorrowRequest.bookId == book_id,
            BorrowRequest.memberId == account.memberId,
            BorrowRequest.status.in_(['Pending', 'Approved']),
        ).first()
        if active_request:
            raise ApiError('You already have an active request for this book.', 409)
        active_loan = Transaction.query.filter_by(bookId=book_id, memberId=account.memberId).filter(
            Transaction.status != 'Returned', Transaction.returnDate.is_(None)
        ).first()
        if active_loan:
            raise ApiError('You already have an active loan for this book.', 409)

        borrow_request = BorrowRequest(
            id='REQ-' + uuid.uuid4().hex[:12].upper(),
            bookId=book_id,
            memberId=account.memberId,
            requestedAt=date.today().isoformat(),
            status='Pending',
        )
        db.session.add(borrow_request)
        db.session.commit()
        return jsonify(borrow_request_dict(borrow_request)), 201

    @app.patch('/api/borrow-requests/<string:request_id>')
    @staff_required
    def review_borrow_request(request_id):
        borrow_request = db.session.get(BorrowRequest, request_id)
        if borrow_request is None:
            abort(404)
        action = json_body().get('action')
        user = current_user()
        if action in {'approve', 'reject'}:
            if borrow_request.status != 'Pending':
                raise ApiError('Only pending requests can be approved or rejected.', 409)
            borrow_request.status = 'Approved' if action == 'approve' else 'Rejected'
            borrow_request.reviewedAt = date.today().isoformat()
            borrow_request.reviewedBy = user.id
            db.session.commit()
            return jsonify(borrow_request_dict(borrow_request))

        if action != 'issue':
            raise ApiError('Choose approve, reject, or issue.')
        if borrow_request.status != 'Approved':
            raise ApiError('Only approved requests can be issued.', 409)

        book = db.session.get(Book, borrow_request.bookId)
        member = db.session.get(Member, borrow_request.memberId)
        duplicate = Transaction.query.filter_by(
            bookId=borrow_request.bookId, memberId=borrow_request.memberId
        ).filter(Transaction.status != 'Returned', Transaction.returnDate.is_(None)).first()
        if duplicate:
            raise ApiError('This member already has an active loan for this book.', 409)

        changed = db.session.execute(update(Book).where(
            Book.id == borrow_request.bookId, Book.availableCopies > 0
        ).values(availableCopies=Book.availableCopies - 1))
        if changed.rowcount != 1:
            db.session.rollback()
            raise ApiError('No copies of this book are currently available.', 409)

        today = date.today()
        transaction = Transaction(
            id='TXN-' + uuid.uuid4().hex[:12].upper(),
            bookId=book.id,
            bookTitle=book.title,
            memberId=member.id,
            memberName=member.name,
            issueDate=today.isoformat(),
            dueDate=(today + timedelta(days=14)).isoformat(),
            status='Issued',
            fineAmount=0,
            finePaid=False,
        )
        db.session.add(transaction)
        db.session.flush()
        transitioned = db.session.execute(update(BorrowRequest).where(
            BorrowRequest.id == request_id, BorrowRequest.status == 'Approved'
        ).values(
            status='Issued',
            reviewedAt=today.isoformat(),
            reviewedBy=user.id,
            transactionId=transaction.id,
        ).execution_options(synchronize_session=False))
        if transitioned.rowcount != 1:
            db.session.rollback()
            raise ApiError('This request has already been processed.', 409)
        db.session.commit()
        db.session.refresh(borrow_request)
        return jsonify(borrow_request_dict(borrow_request))

    @app.post('/api/transactions')
    @staff_required
    def issue_book():
        data = json_body()
        book_id = required_text(data, 'bookId', 50, 'Book')
        member_id = required_text(data, 'memberId', 50, 'Member')
        due_date = validate_date(data.get('dueDate'), 'Due date')
        today = date.today()
        if due_date <= today:
            raise ApiError('Due date must be after today.')
        book = db.session.get(Book, book_id)
        member = db.session.get(Member, member_id)
        if book is None or member is None:
            raise ApiError('Choose an existing book and member.', 404)
        duplicate = Transaction.query.filter_by(bookId=book_id, memberId=member_id).filter(
            Transaction.status != 'Returned', Transaction.returnDate.is_(None)).first()
        if duplicate:
            raise ApiError('This member already has an active loan for this book.', 409)
        changed = db.session.execute(update(Book).where(
            Book.id == book_id, Book.availableCopies > 0
        ).values(availableCopies=Book.availableCopies - 1))
        if changed.rowcount != 1:
            db.session.rollback()
            raise ApiError('No copies of this book are currently available.', 409)
        transaction = Transaction(
            id='TXN-' + uuid.uuid4().hex[:12].upper(), bookId=book.id, bookTitle=book.title,
            memberId=member.id, memberName=member.name, issueDate=today.isoformat(),
            dueDate=due_date.isoformat(), status='Issued', fineAmount=0, finePaid=False,
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify(transaction.to_dict()), 201

    @app.post('/api/transactions/<string:transaction_id>/return')
    @login_required
    def return_book(transaction_id):
        transaction = db.session.get(Transaction, transaction_id)
        if transaction is None:
            abort(404)

        user = current_user()
        if user.role == 'student':
            account = StudentAccount.query.filter_by(userId=user.id).first()
            if account is None or account.memberId != transaction.memberId:
                return jsonify({'error': 'You can only return your own loans.'}), 403
        elif user.role not in {'admin', 'librarian'}:
            return jsonify({'error': 'Administrator or librarian access is required.'}), 403

        data = request.get_json(silent=True) or {}
        today = date.today().isoformat()
        fine = calculate_fine(transaction.dueDate)[1]
        fine_paid = (bool(data.get('finePaid', fine == 0)) if user.role != 'student' else False) if fine else True
        returned = db.session.execute(update(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.returnDate.is_(None),
            Transaction.status != 'Returned',
        ).values(
            returnDate=today,
            status='Returned',
            fineAmount=fine,
            finePaid=fine_paid,
        ).execution_options(synchronize_session=False))
        if returned.rowcount != 1:
            db.session.rollback()
            raise ApiError('This transaction has already been returned.', 409)

        changed = db.session.execute(update(Book).where(
            Book.id == transaction.bookId, Book.availableCopies < Book.totalCopies
        ).values(availableCopies=Book.availableCopies + 1))
        if changed.rowcount != 1:
            db.session.rollback()
            raise ApiError('Book inventory is inconsistent; return was not recorded.', 409)
        db.session.commit()
        db.session.refresh(transaction)
        return jsonify(transaction.to_dict())

    @app.post('/api/transactions/<string:transaction_id>/renew')
    @staff_required
    def renew_book(transaction_id):
        transaction = db.session.get(Transaction, transaction_id)
        if transaction is None:
            abort(404)
        if transaction.returnDate is not None or transaction.status == 'Returned':
            raise ApiError('Returned transactions cannot be renewed.', 409)
        if transaction.dueDate < date.today().isoformat():
            raise ApiError('Overdue loans must be returned before renewal.', 409)
        data = request.get_json(silent=True) or {}
        days = parse_integer(data.get('days', 14), 'Renewal days', 1, 30)
        transaction.dueDate = (date.fromisoformat(transaction.dueDate) + timedelta(days=days)).isoformat()
        transaction.status = 'Issued'
        db.session.commit()
        return jsonify(transaction.to_dict())

    @app.get('/api/dashboard')
    @staff_required
    def dashboard():
        books = Book.query.all()
        members_count = Member.query.count()
        transactions = Transaction.query.all()
        as_of_date = date.today().isoformat()
        active = [txn for txn in transactions if txn.returnDate is None and txn.status != 'Returned']
        overdue = [txn for txn in active if txn.dueDate < as_of_date]
        return jsonify({
            'asOfDate': as_of_date,
            'totalBooks': len(books),
            'totalCopies': sum(book.totalCopies or 0 for book in books),
            'availableCopies': sum(book.availableCopies or 0 for book in books),
            'issuedCopies': sum((book.totalCopies or 0) - (book.availableCopies or 0) for book in books),
            'totalMembers': members_count,
            'activeIssues': len(active),
            'overdueCount': len(overdue),
            'pendingFines': sum(max(txn.fineAmount or 0, calculate_fine(txn.dueDate)[1]) for txn in overdue),
        })

    @app.cli.command('create-admin')
    def create_admin():
        """Interactively create the first administrator without default credentials."""
        username = click.prompt('Administrator username').strip()
        password = click.prompt('Administrator password', hide_input=True, confirmation_prompt=True)
        if len(username) < 3 or len(password) < 12:
            raise click.ClickException('Username must be at least 3 characters and password at least 12 characters.')
        if User.query.filter(func.lower(User.username) == username.lower()).first():
            raise click.ClickException('That username already exists.')
        db.session.add(User(username=username, passwordHash=generate_password_hash(password), role='admin'))
        db.session.commit()
        click.echo('Administrator account created.')

    with app.app_context():
        db.create_all()
        if not app.config.get('TESTING'):
            Index('ix_transaction_book_status', Transaction.bookId, Transaction.status).create(db.engine, checkfirst=True)
            Index('ix_transaction_member_status', Transaction.memberId, Transaction.status).create(db.engine, checkfirst=True)

    return app


def __getattr__(name):
    if name == 'app':
        application = create_app()
        globals()['app'] = application
        return application
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=int(os.environ.get('PORT', '5000')), debug=False)

