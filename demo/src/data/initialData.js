// Comprehensive initial sample data for the Library Management System

export const INITIAL_BOOKS = [
  {
    id: "b-1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    isbn: "978-0262033848",
    category: "Computer Science",
    publishedYear: 2009,
    totalCopies: 6,
    availableCopies: 4,
    rating: 4.8,
    shelfLocation: "A-102",
    description: "The leading textbook on computer algorithms, covering a broad range of algorithms in depth, yet making their design and analysis accessible to all levels of readers.",
    coverImage: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-2",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Software Engineering",
    publishedYear: 2008,
    totalCopies: 5,
    availableCopies: 3,
    rating: 4.7,
    shelfLocation: "B-204",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book reveals the craftsmanship of writing great code.",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-3",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Software Engineering",
    publishedYear: 1994,
    totalCopies: 4,
    availableCopies: 2,
    rating: 4.6,
    shelfLocation: "B-205",
    description: "Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring problems.",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-4",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    isbn: "978-0136042594",
    category: "Artificial Intelligence",
    publishedYear: 2020,
    totalCopies: 5,
    availableCopies: 4,
    rating: 4.9,
    shelfLocation: "C-301",
    description: "The authoritative, most widely used and accepted AI textbook worldwide. Explores state-of-the-art developments in machine learning, deep learning, and multi-agent systems.",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-5",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    category: "Computer Science",
    publishedYear: 2017,
    totalCopies: 7,
    availableCopies: 5,
    rating: 4.9,
    shelfLocation: "A-108",
    description: "The big ideas behind reliable, scalable, and maintainable systems. Key principles for data storage, processing, replication, partitioning, and consistency.",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-6",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
    isbn: "978-1119800361",
    category: "Computer Science",
    publishedYear: 2018,
    totalCopies: 4,
    availableCopies: 2,
    rating: 4.5,
    shelfLocation: "A-104",
    description: "The classic dinosaur book on operating systems covering processes, threads, memory management, file systems, distributed systems, and security.",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-7",
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry F. Korth",
    isbn: "978-0078022159",
    category: "Database Systems",
    publishedYear: 2019,
    totalCopies: 6,
    availableCopies: 6,
    rating: 4.4,
    shelfLocation: "D-401",
    description: "Fundamental concepts of database management, relational algebra, SQL, indexing, transaction processing, concurrency control, and NoSQL databases.",
    coverImage: "https://images.unsplash.com/photo-1507842229451-79b1be8d6290?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-8",
    title: "Computer Networking: A Top-Down Approach",
    author: "James Kurose, Keith Ross",
    isbn: "978-0136681557",
    category: "Networking",
    publishedYear: 2021,
    totalCopies: 5,
    availableCopies: 4,
    rating: 4.7,
    shelfLocation: "E-502",
    description: "Motivates students with top-down layered architecture, focusing on the Internet and fundamental networking protocols including HTTP, DNS, TCP/IP, and wireless.",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-9",
    title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    isbn: "978-0262035613",
    category: "Artificial Intelligence",
    publishedYear: 2016,
    totalCopies: 3,
    availableCopies: 1,
    rating: 4.8,
    shelfLocation: "C-305",
    description: "An MIT Press textbook introducing deep learning techniques used in industry and academia, from linear algebra basics to CNNs, RNNs, and generative models.",
    coverImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-10",
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    isbn: "978-0135957059",
    category: "Software Engineering",
    publishedYear: 2019,
    totalCopies: 6,
    availableCopies: 4,
    rating: 4.8,
    shelfLocation: "B-201",
    description: "Your journey to mastery. Packed with practical advice on career development, responsibility, code architecture, testing, and continuous learning.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-11",
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    isbn: "978-0984782857",
    category: "Career & Interview",
    publishedYear: 2015,
    totalCopies: 8,
    availableCopies: 6,
    rating: 4.9,
    shelfLocation: "F-601",
    description: "189 programming questions and solutions, covering data structures, algorithm problem-solving strategies, behavioral interview prep, and Big-O notation.",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "b-12",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "978-0062316097",
    category: "General Reading",
    publishedYear: 2014,
    totalCopies: 4,
    availableCopies: 3,
    rating: 4.7,
    shelfLocation: "G-701",
    description: "Explores how biology and history have defined us and enhanced our understanding of what it means to be human, from foraging ancestors to the modern age.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600"
  }
];

export const INITIAL_MEMBERS = [
  {
    id: "MEM-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@college.edu",
    role: "Student",
    department: "Computer Science & Engineering",
    phone: "+91 98765-43210",
    joinDate: "2024-08-15",
    status: "Active",
    borrowedCount: 2
  },
  {
    id: "MEM-102",
    name: "Dr. Sunita Patel",
    email: "sunita.patel@college.edu",
    role: "Faculty",
    department: "Information Technology",
    phone: "+91 98123-45678",
    joinDate: "2023-01-10",
    status: "Active",
    borrowedCount: 1
  },
  {
    id: "MEM-103",
    name: "Rohan Verma",
    email: "rohan.verma@college.edu",
    role: "Student",
    department: "Artificial Intelligence",
    phone: "+91 97654-32109",
    joinDate: "2024-09-01",
    status: "Active",
    borrowedCount: 1
  },
  {
    id: "MEM-104",
    name: "Ananya Iyer",
    email: "ananya.iyer@college.edu",
    role: "Student",
    department: "Electronics & Communication",
    phone: "+91 96543-21098",
    joinDate: "2024-08-20",
    status: "Active",
    borrowedCount: 2
  },
  {
    id: "MEM-105",
    name: "Prof. Rajesh Nair",
    email: "rajesh.nair@college.edu",
    role: "Faculty",
    department: "Computer Science & Engineering",
    phone: "+91 95432-10987",
    joinDate: "2022-07-15",
    status: "Active",
    borrowedCount: 0
  },
  {
    id: "MEM-106",
    name: "Meera Deshmukh",
    email: "meera.d@college.edu",
    role: "Student",
    department: "Data Science",
    phone: "+91 94321-09876",
    joinDate: "2024-09-10",
    status: "Active",
    borrowedCount: 1
  }
];

// Seed issue transactions (including an overdue one to demonstrate fine calculation!)
export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-1001",
    bookId: "b-1",
    bookTitle: "Introduction to Algorithms",
    memberId: "MEM-101",
    memberName: "Aarav Sharma",
    issueDate: "2026-08-20",
    dueDate: "2026-09-03", // Overdue!
    returnDate: null,
    status: "Overdue",
    fineAmount: 20,
    finePaid: false
  },
  {
    id: "TXN-1002",
    bookId: "b-2",
    bookTitle: "Clean Code: A Handbook of Agile Software Craftsmanship",
    memberId: "MEM-101",
    memberName: "Aarav Sharma",
    issueDate: "2026-08-28",
    dueDate: "2026-09-11",
    returnDate: null,
    status: "Issued",
    fineAmount: 0,
    finePaid: false
  },
  {
    id: "TXN-1003",
    bookId: "b-3",
    bookTitle: "Design Patterns: Elements of Reusable Object-Oriented Software",
    memberId: "MEM-102",
    memberName: "Dr. Sunita Patel",
    issueDate: "2026-08-25",
    dueDate: "2026-09-15",
    returnDate: null,
    status: "Issued",
    fineAmount: 0,
    finePaid: false
  },
  {
    id: "TXN-1004",
    bookId: "b-6",
    bookTitle: "Operating System Concepts",
    memberId: "MEM-103",
    memberName: "Rohan Verma",
    issueDate: "2026-08-30",
    dueDate: "2026-09-13",
    returnDate: null,
    status: "Issued",
    fineAmount: 0,
    finePaid: false
  },
  {
    id: "TXN-1005",
    bookId: "b-9",
    bookTitle: "Deep Learning",
    memberId: "MEM-104",
    memberName: "Ananya Iyer",
    issueDate: "2026-08-22",
    dueDate: "2026-09-05", // Overdue!
    returnDate: null,
    status: "Overdue",
    fineAmount: 10,
    finePaid: false
  },
  {
    id: "TXN-1006",
    bookId: "b-10",
    bookTitle: "The Pragmatic Programmer",
    memberId: "MEM-104",
    memberName: "Ananya Iyer",
    issueDate: "2026-08-29",
    dueDate: "2026-09-12",
    returnDate: null,
    status: "Issued",
    fineAmount: 0,
    finePaid: false
  },
  {
    id: "TXN-1007",
    bookId: "b-5",
    bookTitle: "Designing Data-Intensive Applications",
    memberId: "MEM-106",
    memberName: "Meera Deshmukh",
    issueDate: "2026-08-26",
    dueDate: "2026-09-09",
    returnDate: null,
    status: "Issued",
    fineAmount: 0,
    finePaid: false
  },
  {
    id: "TXN-1008",
    bookId: "b-8",
    bookTitle: "Computer Networking: A Top-Down Approach",
    memberId: "MEM-105",
    memberName: "Prof. Rajesh Nair",
    issueDate: "2026-08-01",
    dueDate: "2026-08-15",
    returnDate: "2026-08-14",
    status: "Returned",
    fineAmount: 0,
    finePaid: true
  },
  {
    id: "TXN-1009",
    bookId: "b-11",
    bookTitle: "Cracking the Coding Interview",
    memberId: "MEM-103",
    memberName: "Rohan Verma",
    issueDate: "2026-08-05",
    dueDate: "2026-08-19",
    returnDate: "2026-08-18",
    status: "Returned",
    fineAmount: 0,
    finePaid: true
  }
];

export const CATEGORIES = [
  "All Categories",
  "Computer Science",
  "Software Engineering",
  "Artificial Intelligence",
  "Database Systems",
  "Networking",
  "Career & Interview",
  "General Reading"
];

