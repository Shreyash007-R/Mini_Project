import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  BookMarked, 
  BookOpen, 
  Users, 
  ArrowUpRight, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  AlertTriangle 
} from 'lucide-react';

export const Dashboard = ({ onOpenAddBook, onOpenIssueBook, onOpenAddMember }) => {
  const { 
    books, 
    transactions, 
    stats, 
    setActiveTab, 
    userRole
  } = useLibrary();

  // Category counts
  const categoryCounts = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 border border-indigo-700/40 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Library Management & Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to LibroHub
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Monitor library circulation, browse tech and academic catalogs, issue and return books, track late penalties, and manage student memberships effortlessly.
          </p>

          {/* Quick Action Shortcuts */}
          {userRole === 'admin' && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenIssueBook}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Issue a Book
              </button>

              <button
                onClick={onOpenAddBook}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Add New Book
              </button>

              <button
                onClick={onOpenAddMember}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-all"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                Register Member
              </button>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overdue Alert Banner if any */}
      {stats.overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Attention: {stats.overdueCount} Book Borrow(s) are Overdue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Late fines accruing
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Total calculated pending fine is ₹{stats.pendingFines}. Review and process returns in the Circulation section.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('circulation')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shrink-0"
          >
            Review Overdue Books
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Titles */}
        <div 
          onClick={() => setActiveTab('catalog')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Titles</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">{stats.totalBooks}</span>
            <span className="text-xs text-slate-400">titles ({stats.totalCopies} total copies)</span>
          </div>
          <div className="mt-2 text-xs text-indigo-400 flex items-center gap-1">
            <span>Explore catalog</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Available Copies */}
        <div 
          onClick={() => setActiveTab('catalog')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available in Shelf</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.availableCopies}</span>
            <span className="text-xs text-slate-400">ready to issue</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400/80">
            {stats.totalCopies > 0 ? Math.round((stats.availableCopies / stats.totalCopies) * 100) : 0}% of inventory available
          </div>
        </div>

        {/* Issued Books */}
        <div 
          onClick={() => setActiveTab('circulation')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Borrows</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400">{stats.activeIssues}</span>
            <span className="text-xs text-slate-400">books held by members</span>
          </div>
          <div className="mt-2 text-xs text-amber-400/80 flex items-center gap-1">
            <span>Manage returns & renewals</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Registered Members */}
        <div 
          onClick={() => setActiveTab('members')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Members</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-purple-300">{stats.totalMembers}</span>
            <span className="text-xs text-slate-400">students & faculty</span>
          </div>
          <div className="mt-2 text-xs text-purple-400/80 flex items-center gap-1">
            <span>View directory</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Category Breakdown & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (1 col) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Catalog by Discipline</h2>
            <span className="text-xs text-slate-400">{Object.keys(categoryCounts).length} Categories</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = Math.round((count / books.length) * 100);
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{category}</span>
                    <span className="text-slate-400 font-mono">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Total Catalog Volume</span>
            <strong className="text-white font-mono">{stats.totalCopies} books</strong>
          </div>
        </div>

        {/* Recent Circulation Activity Feed (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Recent Circulation Activity</h2>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View Full History →
            </button>
          </div>

          <div className="divide-y divide-slate-800/70 overflow-hidden">
            {recentTransactions.map((txn) => {
              const isOverdue = txn.status === 'Overdue';
              const isReturned = txn.status === 'Returned';

              return (
                <div key={txn.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isReturned
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isOverdue
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {isReturned ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isOverdue ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {txn.bookTitle}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        Borrower: <span className="text-slate-300">{txn.memberName}</span> · Due: {txn.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isReturned
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isOverdue
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {txn.status}
                    </span>
                    {txn.fineAmount > 0 && !txn.finePaid && (
                      <div className="text-[11px] text-rose-400 font-medium mt-0.5">
                        Fine: ₹{txn.fineAmount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
