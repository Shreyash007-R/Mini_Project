import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { calculateFineForDate, filterActiveLoans, getLocalDateString } from '../../lib/circulation';
import { 
  ArrowLeftRight, 
  Search, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  IndianRupee,
  RefreshCw
} from 'lucide-react';

export const CirculationView = ({ onOpenIssueBook, onOpenReturnModal }) => {
  const { 
    transactions, 
    renewBook, 
    userRole, 
    stats,
    transactionError,
    dashboardStats,
  } = useLibrary();

  const [filterType, setFilterType] = useState('all'); // 'all', 'overdue', 'dueSoon'
  const [search, setSearch] = useState('');

  const todayStr = dashboardStats?.asOfDate || getLocalDateString();

  // Active issues (not returned)
  const activeIssues = useMemo(() => {
    return filterActiveLoans(transactions, { search, filterType, today: todayStr })
      .map((transaction) => {
        const { overdueDays, fine } = calculateFineForDate(transaction.dueDate, todayStr);
        return {
          ...transaction,
          overdueDays,
          calculatedFine: Math.max(Number(transaction.fineAmount) || 0, fine),
          isOverdue: overdueDays > 0,
        };
      });
  }, [transactions, search, filterType, todayStr]);

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Stat Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Circulation & Borrow Tracking</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time control for active book checkouts, renewals, and overdue penalty processing
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => onOpenIssueBook(null)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue a Book
          </button>
        )}
      </div>

      {/* Circulation KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Currently Issued</div>
            <div className="text-xl font-bold text-white">{stats.activeIssues} books</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Overdue Returns</div>
            <div className="text-xl font-bold text-rose-400">{stats.overdueCount} books</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Accruing Fine Amount</div>
            <div className="text-xl font-bold text-amber-300">₹{stats.pendingFines}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or member..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Active ({stats.activeIssues})
          </button>
          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Overdue ({stats.overdueCount})
          </button>
          <button
            onClick={() => setFilterType('dueSoon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'dueSoon'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Due Soon
          </button>
        </div>
      </div>

      {/* Active Issues Table */}
      {transactionError ? (
        <div role="alert" className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
          <h3 className="text-sm font-bold">Unable to load circulation data</h3>
          <p className="text-xs mt-1">{transactionError}</p>
        </div>
      ) : activeIssues.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Active Issues</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no currently issued books under this filter. All borrowings are up-to-date.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrower Member</th>
                  <th className="py-3 px-4">Issued On</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status & Fine</th>
                  {userRole === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeIssues.map((issue) => {
                  return (
                    <tr key={issue.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">
                        {issue.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{issue.bookTitle}</div>
                        <div className="text-[11px] text-slate-400">ID: {issue.bookId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{issue.memberName}</div>
                        <div className="text-[11px] text-slate-400">ID: {issue.memberId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {issue.issueDate}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <span className={issue.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {issue.dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {issue.isOverdue ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              {issue.overdueDays}d Overdue
                            </span>
                            <div className="text-[11px] text-rose-400 font-semibold mt-1">
                              Fine: ₹{issue.calculatedFine}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Active
                          </span>
                        )}
                      </td>
                      {userRole === 'admin' && (
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => renewBook(issue.id, 14)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
                            title="Renew for another 14 days"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Renew
                          </button>
                          <button
                            onClick={() => onOpenReturnModal(issue)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center gap-1 shadow-sm transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Return
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
