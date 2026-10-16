import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  TrendingUp, 
  Award, 
  Layers, 
  Users, 
  IndianRupee,
  BookCheck
} from 'lucide-react';

export const AnalyticsView = () => {
  const { books, members, transactions, stats } = useLibrary();

  // Category counts and volume
  const categoryStats = books.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = { titles: 0, copies: 0, available: 0 };
    }
    acc[book.category].titles += 1;
    acc[book.category].copies += (book.totalCopies || 0);
    acc[book.category].available += (book.availableCopies || 0);
    return acc;
  }, {});

  // Most issued books calculation
  const bookBorrowCount = transactions.reduce((acc, t) => {
    acc[t.bookTitle] = (acc[t.bookTitle] || 0) + 1;
    return acc;
  }, {});

  const topBooks = Object.entries(bookBorrowCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Member role distribution
  const memberRoles = members.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  const circulationRate = stats.totalCopies > 0 
    ? Math.round((stats.issuedCopies / stats.totalCopies) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Library Analytics & Insights</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Visual metrics on catalog utilization, popular disciplines, and member engagement
        </p>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Circulation Velocity</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{circulationRate}%</div>
          <p className="text-xs text-slate-400">of total collection is actively in use</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Stock Health Ratio</span>
            <BookCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {stats.totalCopies > 0 ? Math.round((stats.availableCopies / stats.totalCopies) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-400">{stats.availableCopies} titles immediately accessible</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Member Engagement</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-purple-300">
            {Math.round((members.filter(m => (m.borrowedCount || 0) > 0).length / (members.length || 1)) * 100)}%
          </div>
          <p className="text-xs text-slate-400">members with active borrow slips</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Fine Exposure</span>
            <IndianRupee className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400">₹{stats.pendingFines}</div>
          <p className="text-xs text-slate-400">accruing across {stats.overdueCount} late books</p>
        </div>

      </div>

      {/* Two Columns: Category Breakdown & Top Borrowed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Table/Bars */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Category Inventory Utilization
            </h2>
            <span className="text-xs text-slate-400">Volume</span>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(categoryStats).map(([category, data]) => {
              const issued = data.copies - data.available;
              const utilization = data.copies > 0 ? Math.round((issued / data.copies) * 100) : 0;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{category}</span>
                    <span className="text-slate-400 font-mono">
                      {issued} / {data.copies} copies issued ({utilization}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-indigo-500 h-2 transition-all duration-500"
                      style={{ width: `${utilization}%` }}
                    />
                    <div
                      className="bg-emerald-500/40 h-2 transition-all duration-500"
                      style={{ width: `${100 - utilization}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>
              <span>Issued Copies</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/40"></span>
              <span>In-Shelf Available</span>
            </div>
          </div>
        </div>

        {/* Most Borrowed Books */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Most Popular Titles
            </h2>
            <span className="text-xs text-slate-400">All-time Borrows</span>
          </div>

          <div className="space-y-3 pt-2">
            {topBooks.map(([title, count], idx) => (
              <div
                key={title}
                className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : idx === 1
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">{title}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-400">{count} checkout{count > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Member Demographics */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Membership Demographics
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(memberRoles).map(([role, count]) => (
                <div key={role} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-750">
                  <div className="text-base font-bold text-white">{count}</div>
                  <div className="text-[11px] text-slate-400">{role}s</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
