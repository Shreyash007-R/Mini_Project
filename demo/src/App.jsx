import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { BookCatalog } from './components/views/BookCatalog';
import { CirculationView } from './components/views/CirculationView';
import { MembersView } from './components/views/MembersView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { StudentManagementView } from './components/views/StudentManagementView';
import { BorrowRequestsView } from './components/views/BorrowRequestsView';
import { StudentDashboard } from './components/views/StudentDashboard';
import { BookModal } from './components/modals/BookModal';
import { BookDetailsModal } from './components/modals/BookDetailsModal';
import { IssueModal } from './components/modals/IssueModal';
import { ReturnModal } from './components/modals/ReturnModal';
import { Toast } from './components/ui/Toast';

const LibraryApp = () => {
  const { activeTab } = useLibrary();

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsBook, setDetailsBook] = useState(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issuePreselectedBook, setIssuePreselectedBook] = useState(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnTransaction, setReturnTransaction] = useState(null);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Modal Triggers
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleOpenDetails = (book) => {
    setDetailsBook(book);
    setIsDetailsModalOpen(true);
  };

  const handleOpenIssue = (book = null) => {
    setIssuePreselectedBook(book);
    setIsIssueModalOpen(true);
  };

  const handleOpenReturn = (txn) => {
    setReturnTransaction(txn);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)} />

      {/* Main App Layout */}
      <div className="flex-1 flex w-full">
        
        {/* Sidebar Navigation */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              onOpenAddBook={handleOpenAddBook}
              onOpenIssueBook={() => handleOpenIssue(null)}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
            />
          )}

          {activeTab === 'catalog' && (
            <BookCatalog 
              onOpenAddBook={handleOpenAddBook}
              onOpenEditBook={handleOpenEditBook}
              onOpenDetails={handleOpenDetails}
              onOpenIssueBook={handleOpenIssue}
            />
          )}

          {activeTab === 'circulation' && (
            <CirculationView 
              onOpenIssueBook={handleOpenIssue}
              onOpenReturnModal={handleOpenReturn}
            />
          )}

          {activeTab === 'members' && (
            <MembersView 
              isAddMemberOpen={isAddMemberOpen}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onCloseAddMember={() => setIsAddMemberOpen(false)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'students' && (
            <StudentManagementView />
          )}

          {activeTab === 'borrowRequests' && (
            <BorrowRequestsView />
          )}
        </main>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LibroHub Library Management System — College Mini Project</span>
          <span>Built with React 19 & Tailwind CSS</span>
        </div>
      </footer>

      {/* Modals */}
      <BookModal 
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        bookToEdit={bookToEdit}
      />

      <BookDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        book={detailsBook}
        onOpenIssue={handleOpenIssue}
        onOpenEdit={handleOpenEditBook}
      />

      <IssueModal 
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedBook={issuePreselectedBook}
      />

      <ReturnModal 
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        transaction={returnTransaction}
      />

      {/* Floating Notifications */}
      <Toast />

    </div>
  );
};

const AppShell = () => {
  const { auth } = useLibrary();
  const [studentLogin, setStudentLogin] = useState(false);

  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-300">Checking active session...</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <LoginPage
        isStudent={studentLogin}
        onSwitchToStudent={() => setStudentLogin(true)}
        onSwitchToAdmin={() => setStudentLogin(false)}
      />
    );
  }

  if (auth.user.role === 'student') {
    return <StudentDashboard />;
  }

  return <LibraryApp />;
};

export default function App() {
  return (
    <LibraryProvider>
      <AppShell />
    </LibraryProvider>
  );
}
