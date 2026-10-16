import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { getLocalDateString } from '../../lib/circulation';
import { X, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

const calculateDefaultDueDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
};

const IssueModalContent = ({ onClose, preselectedBook = null }) => {
  const { books, members, issueBook } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState(() => {
    if (preselectedBook) return preselectedBook.id;
    const firstAvailable = books.find((b) => b.availableCopies > 0);
    return firstAvailable ? firstAvailable.id : (books[0]?.id || '');
  });

  const [selectedMemberId, setSelectedMemberId] = useState(() => {
    return members.length > 0 ? members[0].id : '';
  });

  const [daysPreset, setDaysPreset] = useState(14);
  const [dueDate, setDueDate] = useState(() => calculateDefaultDueDate(14));
  const [error, setError] = useState('');

  const handleDaysChange = (days) => {
    setDaysPreset(days);
    setDueDate(calculateDefaultDueDate(days));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('Please select a book.');
      return;
    }
    if (!selectedMemberId) {
      setError('Please select a member.');
      return;
    }
    if (!dueDate) {
      setError('Please choose a return due date.');
      return;
    }

    const book = books.find((b) => b.id === selectedBookId);
    if (!book || book.availableCopies <= 0) {
      setError('Selected book has no available copies.');
      return;
    }

    const success = await issueBook({
      bookId: selectedBookId,
      memberId: selectedMemberId,
      dueDate,
    });

    if (success) {
      onClose();
    }
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Issue Book</h2>
              <p className="text-xs text-slate-400">Checkout a copy to a registered student or faculty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Book Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Book <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {books.map((b) => (
                <option 
                  key={b.id} 
                  value={b.id} 
                  disabled={b.availableCopies <= 0}
                >
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>

            {selectedBook && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Shelf: <strong className="text-indigo-300 font-mono">{selectedBook.shelfLocation || 'A-101'}</strong>
                </span>
                <span className={selectedBook.availableCopies > 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {selectedBook.availableCopies} Copies in Stock
                </span>
              </div>
            )}
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Member (Borrower) <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} · {m.department}) - ID: {m.id}
                </option>
              ))}
            </select>

            {selectedMember && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate">
                  {selectedMember.email}
                </span>
                <span className="text-slate-300">
                  Currently holding: <strong className="text-indigo-400">{selectedMember.borrowedCount || 0} books</strong>
                </span>
              </div>
            )}
          </div>

          {/* Due Date & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Due Date Duration
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleDaysChange(days)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    daysPreset === days
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="date"
                value={dueDate}
                min={getLocalDateString()}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setDaysPreset(null);
                }}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Expected return on or before {dueDate}. A late fee of ₹5/day applies past this date.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedBook && selectedBook.availableCopies <= 0}
              className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedBook && selectedBook.availableCopies > 0
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Issue
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export const IssueModal = ({ isOpen, onClose, preselectedBook = null }) => {
  if (!isOpen) return null;

  return (
    <IssueModalContent
      key={preselectedBook ? preselectedBook.id : 'issue-new'}
      onClose={onClose}
      preselectedBook={preselectedBook}
    />
  );
};
