import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { getLocalDateString } from '../../lib/circulation';
import { X, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

export const ReturnModal = ({ isOpen, onClose, transaction }) => {
  const { returnBook, calculateFine, DAILY_FINE_RATE } = useLibrary();
  const [finePaid, setFinePaid] = useState(true);

  if (!isOpen || !transaction) return null;

  const todayStr = getLocalDateString();
  const { overdueDays, fine } = calculateFine(transaction.dueDate, todayStr);

  const handleReturn = async () => {
    const success = await returnBook(transaction.id, finePaid);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Return Book</h2>
              <p className="text-xs text-slate-400">Process returned copy and verify penalties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Card */}
        <div className="p-6 space-y-4">
          
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2.5">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Book Title</span>
              <div className="text-sm font-bold text-white leading-tight mt-0.5">{transaction.bookTitle}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-750 text-xs">
              <div>
                <span className="text-slate-400">Borrower:</span>
                <div className="font-semibold text-slate-200">{transaction.memberName}</div>
                <div className="text-[11px] text-slate-400">ID: {transaction.memberId}</div>
              </div>
              <div>
                <span className="text-slate-400">Due Date:</span>
                <div className={`font-semibold ${overdueDays > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {transaction.dueDate}
                </div>
                <div className="text-[11px] text-slate-400">Issued: {transaction.issueDate}</div>
              </div>
            </div>
          </div>

          {/* Overdue Calculation Notice */}
          {overdueDays > 0 ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Overdue by {overdueDays} days!</span>
              </div>
              <p className="text-xs text-rose-200/80">
                Late fine rate: ₹{DAILY_FINE_RATE}/day. Total fine calculated is <strong>₹{fine}</strong>.
              </p>

              <label className="mt-2 flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                />
                <span>Fine amount of ₹{fine} collected & cleared</span>
              </label>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2.5 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Returned on time! No overdue fines applicable.</span>
            </div>
          )}

          {/* Return Date Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Return Confirmation Date:</span>
            <strong className="text-white font-mono">{todayStr}</strong>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReturn}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Return
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
