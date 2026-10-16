from app import app, db, Book, Member, Transaction
import json

books = [
  {
    "id": "b-1",
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen, Charles E. Leiserson",
    "isbn": "978-0262033848",
    "category": "Computer Science",
    "publishedYear": 2009,
    "totalCopies": 6,
    "availableCopies": 4,
    "rating": 4.8,
    "shelfLocation": "A-102",
    "description": "The leading textbook on computer algorithms.",
    "coverImage": "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600"
  },
  {
    "id": "b-2",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "978-0132350884",
    "category": "Software Engineering",
    "publishedYear": 2008,
    "totalCopies": 5,
    "availableCopies": 3,
    "rating": 4.7,
    "shelfLocation": "B-204",
    "description": "A Handbook of Agile Software Craftsmanship.",
    "coverImage": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600"
  }
]

members = [
    {
      "id": "MEM-101",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@college.edu",
      "role": "Student",
      "department": "Computer Science & Engineering",
      "phone": "+91 98765-43210",
      "joinDate": "2024-08-15",
      "status": "Active",
      "borrowedCount": 2
    },
    {
      "id": "MEM-102",
      "name": "Dr. Sunita Patel",
      "email": "sunita.patel@college.edu",
      "role": "Faculty",
      "department": "Information Technology",
      "phone": "+91 98123-45678",
      "joinDate": "2023-01-10",
      "status": "Active",
      "borrowedCount": 0
    }
]

transactions = [
    {
      "id": "TXN-1001",
      "bookId": "b-1",
      "bookTitle": "Introduction to Algorithms",
      "memberId": "MEM-101",
      "memberName": "Aarav Sharma",
      "issueDate": "2026-08-20",
      "dueDate": "2026-09-03",
      "returnDate": None,
      "status": "Overdue",
      "fineAmount": 20,
      "finePaid": False
    }
]

with app.app_context():
    db.create_all()
    
    # Clear existing data
    Book.query.delete()
    Member.query.delete()
    Transaction.query.delete()

    for b in books:
        book = Book(**b)
        db.session.add(book)
        
    for m in members:
        member = Member(**m)
        db.session.add(member)
        
    for t in transactions:
        txn = Transaction(**t)
        db.session.add(txn)
        
    db.session.commit()
    print("Database seeded successfully!")

