# LibroHub — Modern Library Management System (Mini Projectull-featured **Library Management System (LMS)** built with **React 19**, **Tailwind CSS v4**, and **Lucide Icons**. Designed for college mini projects, viva presentations, and portfolio showcases.

---

## 🌟 Key Features

### 1. 📊 Interactive Dashboard
- **Real-Time KPIs**: Total catalog titles, available shelf copies, active borrows, registered members, overdue items, and pending late fines.
- **Overdue Alert Banner**: Automatically flags overdue checkouts with accrued late fees.
- **Category Distribution**: Visual progress indicators of books across Computer Science, AI, Networking, Databases, Software Engineering, etc.
- **Circulation Activity Feed**: Live audit timeline of recent issues, returns, and overdue notifications.

### 2. 📚 Book Catalog & Inventory Management
- **Search & Filters**: Instant search by Title, Author, or ISBN; category filter tabs; in-stock/out-of-stock availability toggles.
- **Sorting**: Sort by Title (A-Z / Z-A), Publication Year, Copies, or Star Rating.
- **View Modes**: Switch seamlessly between modern **Grid Cards** and compact **Table/List View**.
- **Full CRUD**: Add new books, edit existing records, view detailed synopsis & current borrowers, and delete books (with validation).
- **Cover Image Presets**: One-click preset picker for fast book creation.

### 3. 🔄 Circulation System (Issue, Return & Renewal)
- **Issue Book**: Select a registered member, select book, set due date (presets: 7, 14, 30 days). Automatically reduces available copy count and updates member status.
- **Return Book with Fine Calculation**: Automatically detects overdue returns and computes late fees (at ₹5/day). Includes fine settlement confirmation.
- **Renewal**: Extend borrowing due dates by 14 days with a single click.

### 4. 👥 Member / Student Directory
- Manage student and faculty library memberships.
- Track currently held books for each member directly on their profile card.
- Add new members with validation and automatic ID generation (`MEM-xxx`).

### 5. 📜 Transaction History & CSV Export
- Full circulation audit trail logging issue dates, due dates, return dates, overdue flags, and fine amounts.
- **Export to CSV**: Download `library_transactions_YYYY-MM-DD.csv` for reporting or professor evaluation.

### 6. 📈 Visual Analytics
- Circulation velocity (% of collection actively borrowed).
- Inventory stock health ratio.
- Most popular borrowed books leaderboard.
- Academic department and member role demographics.

### 7. 💾 LocalStorage Persistence & Demo Reset
- All changes (new books, issues, returns, members) persist across browser refreshes via `localStorage`.
- **"Reset Data"** button in the top navigation to instantly restore the original sample dataset anytime.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or the port shown in terminal).

### 3. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
demo/
├── src/
│   ├── assets/             # Logos and static assets
│   ├── components/
│   │   ├── Navbar.jsx          # Top bar with search, role switch, reset button
│   │   ├── Sidebar.jsx         # Navigation drawer and tabs
│   │   ├── Dashboard.jsx       # Overview, KPI cards, category breakdown
│   │   ├── BookCatalog.jsx     # Grid/table inventory with search & filter
│   │   ├── BookModal.jsx       # Add & edit book modal
│   │   ├── BookDetailsModal.jsx# Book information & current borrowers
│   │   ├── CirculationView.jsx # Active issues & return triggers
│   │   ├── IssueModal.jsx      # Checkout modal with member & due date picker
│   │   ├── ReturnModal.jsx     # Return confirmation & overdue fine calculator
│   │   ├── MembersView.jsx     # Member cards & registration modal
│   │   ├── TransactionsView.jsx# Full audit log with CSV export
│   │   ├── AnalyticsView.jsx   # Visual metrics & top borrowed titles
│   │   └── Toast.jsx           # Floating toast notification system
│   ├── context/
│   │   └── LibraryContext.jsx  # Global state, persistence, business logic
│   ├── data/
│   │   └── initialData.js      # Seed data (12+ books, 6 members, transactions)
│   ├── App.jsx                 # Main layout and modal manager
│   ├── index.css               # Tailwind CSS & scrollbar styles
│   └── main.jsx                # Application root mount
├── package.json
└── vite.config.js
```
