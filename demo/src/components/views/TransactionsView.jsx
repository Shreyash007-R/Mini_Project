import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { ReceiptModal } from '../modals/ReceiptModal';
import { 
  Search, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen,
  Printer
} from 'lucide-react';

export const TransactionsView = () => {
  const { transactions, notify } = useLibrary();

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (t.id?.toLowerCase() || '').includes(q) ||
        (t.bookTitle?.toLowerCase() || '').includes(q) ||
        (t.memberName?.toLowerCase() || '').includes(q) ||
        (t.memberId?.toLowerCase() || '').includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      return (t.status || '').toLowerCase() === statusFilter.toLowerCase();
    });
  }, [transactions, search, statusFilter]);

  // Export transactions to CSV
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      notify('No transactions to export', 'error');
      return;
    }

    const headers = ['Transaction ID', 'Book Title', 'Book ID', 'Member Name', 'Member ID', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine Amount', 'Fine Paid'];
    const rows = filteredTransactions.map((t) => [
      `"${t.id || ''}"`,
      `"${(t.bookTitle || '').replace(/"/g, '""')}"`,
      `"${t.bookId || ''}"`,
      `"${(t.memberName || '').replace(/"/g, '""')}"`,
      `"${t.memberId || ''}"`,
      `"${t.issueDate || ''}"`,
      `"${t.dueDate || ''}"`,
      `"${t.returnDate || 'N/A'}"`,
      `"${t.status || ''}"`,
      `"${t.fineAmount || 0}"`,
      `"${t.finePaid ? 'Yes' : 'No'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `library_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Transaction logs exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Circulation History & Audit Trail</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive log of all book checkouts, returns, extensions, and fine settlements
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-slate-700 shadow-md transition-all"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          Export to CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, or borrower..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['all', 'Issued', 'Returned', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter.toLowerCase() === status.toLowerCase()
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'all' ? `All (${transactions.length})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fine Settled</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isReturned = t.status === 'Returned';
                  const isOverdue = t.status === 'Overdue';

                  return (
                    <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        {t.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white max-w-xs truncate">{t.bookTitle}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Book ID: {t.bookId}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{t.memberName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Member ID: {t.memberId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {t.issueDate}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {t.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {t.returnDate || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isReturned
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isOverdue
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isReturned && <CheckCircle className="w-3 h-3" />}
                          {isOverdue && <AlertTriangle className="w-3 h-3" />}
                          {!isReturned && !isOverdue && <BookOpen className="w-3 h-3" />}
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {t.fineAmount > 0 ? (
                          <div className={t.finePaid ? 'text-emerald-400 font-medium' : 'text-rose-400 font-bold'}>
                            ₹{t.fineAmount} {t.finePaid ? '(Paid)' : '(Unpaid)'}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceiptTxn(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors text-xs border border-slate-700/60"
                          title="View official printable circulation receipt"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-400" />
                          Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal 
        isOpen={Boolean(selectedReceiptTxn)}
        onClose={() => setSelectedReceiptTxn(null)}
        transaction={selectedReceiptTxn}
      />

    </div>
  );
};
