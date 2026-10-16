from datetime import date, timedelta

from app import Book, Member, Transaction, User, create_app, db
from werkzeug.security import generate_password_hash


class TestApp:
    def setup_method(self):
        self.app = create_app(
            {
                'TESTING': True,
                'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
                'SECRET_KEY': 'test-secret-key',
                'FRONTEND_ORIGIN': 'http://localhost:5173',
            }
        )
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()
            user = User(username='admin', passwordHash=generate_password_hash('StrongPass123!'), role='admin')
            db.session.add(user)
            db.session.commit()

    def test_login_and_session_restore(self):
        response = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'StrongPass123!'} )
        assert response.status_code == 200
        payload = response.get_json()
        assert payload['user']['username'] == 'admin'

        session_response = self.client.get('/api/auth/session')
        assert session_response.status_code == 200
        assert session_response.get_json()['user']['username'] == 'admin'

    def test_circulation_api_summary_and_direct_issue_validation(self):
        login = self.client.post('/api/auth/login', json={
            'username': 'admin', 'password': 'StrongPass123!',
        }).get_json()
        headers = {'X-CSRFToken': login['csrfToken']}

        with self.app.app_context():
            book = Book(
                id='BOOK-CIRCULATION', title='Circulation Fixture', author='Test Author',
                totalCopies=1, availableCopies=1,
            )
            overdue_book = Book(
                id='BOOK-OVERDUE', title='Overdue Fixture', author='Test Author',
                totalCopies=1, availableCopies=0,
            )
            returned_book = Book(
                id='BOOK-RETURNED', title='Returned Fixture', author='Test Author',
                totalCopies=1, availableCopies=1,
            )
            first_member = Member(
                id='MEMBER-CIRC-1', name='Alex Fixture', email='alex-fixture@example.edu',
            )
            second_member = Member(
                id='MEMBER-CIRC-2', name='Sam Fixture', email='sam-fixture@example.edu',
            )
            db.session.add_all([book, overdue_book, returned_book, first_member, second_member])
            db.session.commit()

        yesterday = (date.today() - timedelta(days=1)).isoformat()
        invalid_due_date = self.client.post('/api/transactions', headers=headers, json={
            'bookId': 'BOOK-CIRCULATION', 'memberId': 'MEMBER-CIRC-1', 'dueDate': yesterday,
        })
        assert invalid_due_date.status_code == 400

        issued = self.client.post('/api/transactions', headers=headers, json={
            'bookId': 'BOOK-CIRCULATION', 'memberId': 'MEMBER-CIRC-1',
            'dueDate': (date.today() + timedelta(days=14)).isoformat(),
        })
        assert issued.status_code == 201
        issued_transaction = issued.get_json()
        assert issued_transaction['bookTitle'] == 'Circulation Fixture'
        assert issued_transaction['memberName'] == 'Alex Fixture'
        assert issued_transaction['issueDate'] == date.today().isoformat()
        assert issued_transaction['dueDate'] == (date.today() + timedelta(days=14)).isoformat()

        unavailable = self.client.post('/api/transactions', headers=headers, json={
            'bookId': 'BOOK-CIRCULATION', 'memberId': 'MEMBER-CIRC-2',
            'dueDate': (date.today() + timedelta(days=14)).isoformat(),
        })
        assert unavailable.status_code == 409

        with self.app.app_context():
            db.session.add_all([
                Transaction(
                    id='TXN-CIRC-OVERDUE', bookId='BOOK-OVERDUE', bookTitle='Overdue Fixture',
                    memberId='MEMBER-CIRC-1', memberName='Alex Fixture', issueDate=yesterday,
                    dueDate=yesterday, status='Issued', fineAmount=0,
                ),
                Transaction(
                    id='TXN-CIRC-RETURNED', bookId='BOOK-RETURNED', bookTitle='Returned Fixture',
                    memberId='MEMBER-CIRC-2', memberName='Sam Fixture', issueDate=yesterday,
                    dueDate=yesterday, returnDate=date.today().isoformat(), status='Returned', fineAmount=25,
                ),
            ])
            db.session.commit()

        transactions = self.client.get('/api/transactions').get_json()
        summary = self.client.get('/api/dashboard').get_json()
        assert summary['asOfDate'] == date.today().isoformat()
        assert summary['activeIssues'] == 2
        assert summary['overdueCount'] == 1
        assert summary['pendingFines'] == 5
        assert next(item for item in transactions if item['id'] == 'TXN-CIRC-OVERDUE')['status'] == 'Overdue'
        assert next(item for item in transactions if item['id'] == 'TXN-CIRC-RETURNED')['status'] == 'Returned'
        books = self.client.get('/api/books').get_json()
        assert next(item for item in books if item['id'] == 'BOOK-CIRCULATION')['availableCopies'] == 0

        returned = self.client.post(
            f"/api/transactions/{issued_transaction['id']}/return",
            headers=headers,
            json={},
        )
        assert returned.status_code == 200
        assert returned.get_json()['status'] == 'Returned'
        updated_summary = self.client.get('/api/dashboard').get_json()
        assert updated_summary['activeIssues'] == 1
        assert updated_summary['overdueCount'] == 1
        books = self.client.get('/api/books').get_json()
        assert next(item for item in books if item['id'] == 'BOOK-CIRCULATION')['availableCopies'] == 1

    def test_mutating_requests_require_csrf_token(self):
        self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'StrongPass123!'})
        response = self.client.post('/api/books', json={
            'title': 'Test Book',
            'author': 'Test Author',
            'isbn': '978-0000000001',
            'category': 'Science',
            'publishedYear': 2024,
            'totalCopies': 2,
            'availableCopies': 2,
            'rating': 4.5,
            'shelfLocation': 'Z-1',
            'description': 'Demo',
            'coverImage': 'https://example.com/cover.jpg',
        })
        assert response.status_code == 403
        assert 'csrf' in response.get_json()['error'].lower()

    def test_student_access_is_limited_to_own_records(self):
        admin_login = self.client.post('/api/auth/login', json={
            'username': 'admin',
            'password': 'StrongPass123!',
        }).get_json()
        admin_csrf = admin_login['csrfToken']

        first_student = self.client.post('/api/students', headers={'X-CSRFToken': admin_csrf}, json={
            'name': 'Avery Student',
            'studentId': 'ROLL-1001',
            'username': 'avery.student',
            'email': 'avery@example.edu',
            'password': 'StudentPass123!',
        })
        second_student = self.client.post('/api/students', headers={'X-CSRFToken': admin_csrf}, json={
            'name': 'Jordan Student',
            'studentId': 'ROLL-1002',
            'username': 'jordan.student',
            'email': 'jordan@example.edu',
            'password': 'StudentPass456!',
        })
        assert first_student.status_code == 201
        assert second_student.status_code == 201
        first_student = first_student.get_json()
        second_student = second_student.get_json()

        duplicate_username = self.client.post('/api/students', headers={'X-CSRFToken': admin_csrf}, json={
            'name': 'Duplicate Username',
            'studentId': 'ROLL-1003',
            'username': 'avery.student',
            'email': 'duplicate-username@example.edu',
            'password': 'StudentPass789!',
        })
        duplicate_student_id = self.client.post('/api/students', headers={'X-CSRFToken': admin_csrf}, json={
            'name': 'Duplicate Student ID',
            'studentId': 'ROLL-1001',
            'username': 'duplicate.student',
            'email': 'duplicate-id@example.edu',
            'password': 'StudentPass789!',
        })
        assert duplicate_username.status_code == 409
        assert duplicate_student_id.status_code == 409

        with self.app.app_context():
            student_user = User.query.filter_by(username='avery.student').one()
            assert student_user.passwordHash != 'StudentPass123!'
            from werkzeug.security import check_password_hash
            assert check_password_hash(student_user.passwordHash, 'StudentPass123!')

        first_book = self.client.post('/api/books', headers={'X-CSRFToken': admin_csrf}, json={
            'title': 'Avery Book', 'author': 'Library Author',
        }).get_json()
        second_book = self.client.post('/api/books', headers={'X-CSRFToken': admin_csrf}, json={
            'title': 'Jordan Book', 'author': 'Library Author',
        }).get_json()
        due_date = (date.today() + timedelta(days=14)).isoformat()
        for book, student in [(first_book, first_student), (second_book, second_student)]:
            response = self.client.post('/api/transactions', headers={'X-CSRFToken': admin_csrf}, json={
                'bookId': book['id'], 'memberId': student['memberId'], 'dueDate': due_date,
            })
            assert response.status_code == 201

        student_client = self.app.test_client()
        login = student_client.post('/api/auth/login', json={
            'username': 'avery.student', 'password': 'StudentPass123!',
        })
        assert login.status_code == 200
        student_csrf = login.get_json()['csrfToken']
        assert student_client.get('/api/books').status_code == 200
        assert student_client.get('/api/members').status_code == 403
        assert student_client.get('/api/dashboard').status_code == 403
        assert student_client.get('/api/students').status_code == 403
        assert student_client.post('/api/students', headers={'X-CSRFToken': student_csrf}, json={}).status_code == 403
        assert student_client.post('/api/members', headers={'X-CSRFToken': student_csrf}, json={}).status_code == 403
        assert student_client.post('/api/transactions', headers={'X-CSRFToken': student_csrf}, json={}).status_code == 403
        profile = student_client.get('/api/student/profile').get_json()
        assert profile['studentId'] == 'ROLL-1001'
        transactions = student_client.get('/api/transactions').get_json()
        assert len(transactions) == 1
        assert transactions[0]['memberId'] == first_student['memberId']

        denied_write = student_client.post('/api/books', headers={'X-CSRFToken': student_csrf}, json={
            'title': 'Unauthorized Book', 'author': 'No Access',
        })
        assert denied_write.status_code == 403

        deactivated = self.client.patch(
            f"/api/students/{first_student['id']}/status",
            headers={'X-CSRFToken': admin_csrf},
            json={'active': False},
        )
        assert deactivated.status_code == 200
        with self.app.app_context():
            from app import Member
            assert db.session.get(Member, first_student['memberId']).status == 'Inactive'
        assert student_client.get('/api/student/profile').status_code == 401
        rejected_login = self.app.test_client().post('/api/auth/login', json={
            'username': 'avery.student', 'password': 'StudentPass123!',
        })
        assert rejected_login.status_code == 401

        reactivated = self.client.patch(
            f"/api/students/{first_student['id']}/status",
            headers={'X-CSRFToken': admin_csrf},
            json={'active': True},
        )
        assert reactivated.status_code == 200
        assert self.app.test_client().post('/api/auth/login', json={
            'username': 'avery.student', 'password': 'StudentPass123!',
        }).status_code == 200

        edited = self.client.put(
            f"/api/students/{first_student['id']}",
            headers={'X-CSRFToken': admin_csrf},
            json={
                'name': 'Avery Updated',
                'studentId': 'ROLL-1001',
                'username': 'avery.student',
                'email': 'avery@example.edu',
            },
        )
        assert edited.status_code == 200
        detail = self.client.get(f"/api/students/{first_student['id']}").get_json()
        assert detail['name'] == 'Avery Updated'
        assert len(detail['transactions']) == 1

    def test_borrow_request_review_and_issue_flow(self):
        admin_login = self.client.post('/api/auth/login', json={
            'username': 'admin', 'password': 'StrongPass123!',
        }).get_json()
        admin_headers = {'X-CSRFToken': admin_login['csrfToken']}
        with self.app.app_context():
            db.session.add(User(
                username='librarian',
                passwordHash=generate_password_hash('LibrarianPass123!'),
                role='librarian',
            ))
            db.session.commit()
        librarian_client = self.app.test_client()
        librarian_login = librarian_client.post('/api/auth/login', json={
            'username': 'librarian', 'password': 'LibrarianPass123!',
        }).get_json()
        librarian_headers = {'X-CSRFToken': librarian_login['csrfToken']}
        students = []
        for student_id, username in [('REQ-1001', 'request.student1'), ('REQ-1002', 'request.student2')]:
            response = self.client.post('/api/students', headers=admin_headers, json={
                'name': username,
                'studentId': student_id,
                'username': username,
                'email': f'{username}@example.edu',
                'password': 'StudentPass123!',
            })
            assert response.status_code == 201
            students.append(response.get_json())

        book = self.client.post('/api/books', headers=admin_headers, json={
            'title': 'Request Test Book', 'author': 'Library Author', 'totalCopies': 1,
        }).get_json()
        second_book = self.client.post('/api/books', headers=admin_headers, json={
            'title': 'Rejected Request Book', 'author': 'Library Author', 'totalCopies': 1,
        }).get_json()

        student_clients = []
        for student in students:
            client = self.app.test_client()
            login = client.post('/api/auth/login', json={
                'username': student['username'], 'password': 'StudentPass123!',
            }).get_json()
            student_clients.append((client, {'X-CSRFToken': login['csrfToken']}))

        first_client, first_headers = student_clients[0]
        second_client, second_headers = student_clients[1]
        first_request = first_client.post('/api/borrow-requests', headers=first_headers, json={
            'bookId': book['id'],
        })
        assert first_request.status_code == 201
        first_request = first_request.get_json()
        assert first_request['status'] == 'Pending'
        assert first_client.post('/api/borrow-requests', headers=first_headers, json={
            'bookId': book['id'],
        }).status_code == 409

        second_request = second_client.post('/api/borrow-requests', headers=second_headers, json={
            'bookId': book['id'],
        })
        assert second_request.status_code == 201
        second_request = second_request.get_json()
        rejected_request = second_client.post('/api/borrow-requests', headers=second_headers, json={
            'bookId': second_book['id'],
        })
        assert rejected_request.status_code == 201
        rejected_request = rejected_request.get_json()

        assert [item['id'] for item in first_client.get('/api/borrow-requests').get_json()] == [first_request['id']]
        assert len(self.client.get('/api/borrow-requests').get_json()) == 3
        assert len(librarian_client.get('/api/borrow-requests').get_json()) == 3
        assert first_client.patch(f"/api/borrow-requests/{first_request['id']}", headers=first_headers, json={
            'action': 'approve',
        }).status_code == 403
        assert self.client.post('/api/borrow-requests', headers=admin_headers, json={
            'bookId': book['id'],
        }).status_code == 403

        approved = librarian_client.patch(f"/api/borrow-requests/{first_request['id']}", headers=librarian_headers, json={
            'action': 'approve',
        })
        assert approved.status_code == 200
        assert approved.get_json()['status'] == 'Approved'
        approved_second = self.client.patch(f"/api/borrow-requests/{second_request['id']}", headers=admin_headers, json={
            'action': 'approve',
        })
        assert approved_second.status_code == 200
        rejected = librarian_client.patch(f"/api/borrow-requests/{rejected_request['id']}", headers=librarian_headers, json={
            'action': 'reject',
        })
        assert rejected.status_code == 200
        assert rejected.get_json()['status'] == 'Rejected'

        issued = self.client.patch(f"/api/borrow-requests/{first_request['id']}", headers=admin_headers, json={
            'action': 'issue',
        })
        assert issued.status_code == 200
        issued = issued.get_json()
        assert issued['status'] == 'Issued'
        assert issued['transactionId']
        with self.app.app_context():
            from app import Book
            assert db.session.get(Book, book['id']).availableCopies == 0

        unavailable = self.client.patch(f"/api/borrow-requests/{second_request['id']}", headers=admin_headers, json={
            'action': 'issue',
        })
        assert unavailable.status_code == 409
        assert 'available' in unavailable.get_json()['error'].lower()
        assert first_client.get('/api/transactions').get_json()[0]['bookId'] == book['id']
        assert second_client.get('/api/transactions').get_json() == []

        transaction_id = issued['transactionId']
        with self.app.app_context():
            from app import Transaction
            transaction = db.session.get(Transaction, transaction_id)
            transaction.dueDate = (date.today() - timedelta(days=1)).isoformat()
            db.session.commit()

        assert second_client.post(
            f'/api/transactions/{transaction_id}/return',
            headers=second_headers,
            json={},
        ).status_code == 403

        returned = first_client.post(
            f'/api/transactions/{transaction_id}/return',
            headers=first_headers,
            json={'finePaid': False},
        )
        assert returned.status_code == 200
        returned = returned.get_json()
        assert returned['status'] == 'Returned'
        assert returned['returnDate'] == date.today().isoformat()
        assert returned['fineAmount'] == 5
        assert returned['finePaid'] is False
        assert first_client.get('/api/transactions').get_json()[0]['id'] == transaction_id
        books = self.client.get('/api/books').get_json()
        assert next(item for item in books if item['id'] == book['id'])['availableCopies'] == 1

        duplicate_return = first_client.post(
            f'/api/transactions/{transaction_id}/return',
            headers=first_headers,
            json={},
        )
        assert duplicate_return.status_code == 409
        books = self.client.get('/api/books').get_json()
        assert next(item for item in books if item['id'] == book['id'])['availableCopies'] == 1

    def test_student_account_persists_across_app_restart(self, tmp_path):
        database_path = (tmp_path / 'student-persistence.db').as_posix()
        config = {
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': f'sqlite:///{database_path}',
            'SECRET_KEY': 'test-secret-key',
            'FRONTEND_ORIGIN': 'http://localhost:5173',
        }
        first_app = create_app(config)
        with first_app.app_context():
            db.session.add(User(
                username='admin',
                passwordHash=generate_password_hash('StrongPass123!'),
                role='admin',
            ))
            db.session.commit()

        first_client = first_app.test_client()
        admin_login = first_client.post('/api/auth/login', json={
            'username': 'admin', 'password': 'StrongPass123!',
        }).get_json()
        created = first_client.post('/api/students', headers={
            'X-CSRFToken': admin_login['csrfToken'],
        }, json={
            'name': 'Persisted Student',
            'studentId': 'ROLL-2001',
            'username': 'persisted.student',
            'email': 'persisted@example.edu',
            'password': 'PersistedPass123!',
        })
        assert created.status_code == 201
        with first_app.app_context():
            db.session.remove()
        restarted_app = create_app(config)
        restarted_client = restarted_app.test_client()
        login = restarted_client.post('/api/auth/login', json={
            'username': 'persisted.student', 'password': 'PersistedPass123!',
        })
        assert login.status_code == 200
        profile = restarted_client.get('/api/student/profile')
        assert profile.status_code == 200
        assert profile.get_json()['studentId'] == 'ROLL-2001'
