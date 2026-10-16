import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  X, 
  Star, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Barcode, 
  UserCheck, 
  AlertCircle
} from 'lucide-react';

export const BookDetailsModal = ({ isOpen, onClose, book, onOpenIssue, onOpenEdit }) => {
  const { transactions, userRole } = useLibrary();

  if (!isOpen || !book) return null;

  // Find active borrowers of this book
  const activeBorrowers = transactions.filter(
    (t) => t.bookId === book.id && t.status !== 'Returned'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Book Cover */}
            <div className="w-full sm:w-48 shrink-0 flex flex-col items-center">
              <div className="w-44 h-60 rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-800">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Badge */}
              <div className="mt-3 w-full text-center">
                {book.availableCopies > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {book.availableCopies} of {book.totalCopies} Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    All Copies Issued
                  </span>
                )}
              </div>
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                  {book.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-2 leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-slate-300 mt-1">by <span className="font-medium text-slate-100">{book.author}</span></p>
              </div>

              {/* Rating & Location Specs */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rating: <strong className="text-white">{book.rating} / 5.0</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Year: <strong className="text-white">{book.publishedYear}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Shelf: <strong className="text-indigo-400 font-mono">{book.shelfLocation || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Barcode className="w-4 h-4 text-slate-400" />
                  <span className="truncate">ISBN: <strong className="text-white font-mono">{book.isbn}</strong></span>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Synopsis / Overview
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2">
                  {book.description || 'No detailed description available for this title.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenIssue(book);
                    }}
                    disabled={book.availableCopies <= 0}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                      book.availableCopies > 0
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Issue This Book
                  </button>
                )}

                {userRole === 'admin' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEdit(book);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    Edit Information
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

            </div>
          </div>

          {/* Current Borrowers Section */}
          {userRole === 'admin' && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Current Borrowers ({activeBorrowers.length})
              </h3>

              {activeBorrowers.length > 0 ? (
                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-850 border border-slate-800 overflow-hidden">
                  {activeBorrowers.map((borrower) => (
                    <div key={borrower.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{borrower.memberName}</div>
                        <div className="text-slate-400 text-[11px]">ID: {borrower.memberId} · Issued: {borrower.issueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-300">Due: {borrower.dueDate}</div>
                        {borrower.status === 'Overdue' ? (
                          <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> Overdue
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No members currently hold a borrowed copy of this book.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
