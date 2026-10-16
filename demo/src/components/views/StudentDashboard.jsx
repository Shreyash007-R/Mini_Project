import React, { useState } from 'react';
import { BookOpen, BookMarked, Search, UserRound, LogOut, CalendarDays, CircleCheck, CircleX, Clock3, RotateCcw, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Toast } from '../ui/Toast';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const StudentDashboard = () => {
  const { books, transactions, borrowRequests, studentProfile, requestBook, returnBook, logout, loading } = useLibrary();
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const query = search.trim().toLowerCase();
  const filteredBooks = books.filter((book) => [book.title, book.author, book.category, book.isbn]
    .some((value) => value?.toLowerCase().includes(query)));
  const activeLoans = transactions.filter((transaction) => transaction.status !== 'Returned' && !transaction.returnDate);
  const history = transactions.filter((transaction) => transaction.status === 'Returned' || transaction.returnDate);
  const handleReturn = async (transaction) => {
    const confirmed = window.confirm(`Return "${transaction.bookTitle}"?`);
    if (confirmed) {
      await returnBook(transaction.id, false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-300">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">LibroHub</p>
              <p className="text-xs text-slate-400">Student Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-500/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-7 sm:px-6 lg:py-9">
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-indigo-900/60 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Your library</p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Welcome, {studentProfile?.name || 'Student'}</h1>
            <p className="mt-2 text-sm text-slate-300">Browse available books and keep track of your loans.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-slate-200">
                <BookOpen className="h-4 w-4 text-indigo-300" />
                {activeLoans.length} active {activeLoans.length === 1 ? 'loan' : 'loans'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-slate-200">
                <CircleCheck className="h-4 w-4 text-emerald-300" />
                {books.length} catalog {books.length === 1 ? 'title' : 'titles'}
              </span>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5" aria-labelledby="profile-title">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-2.5 text-indigo-300"><UserRound className="h-5 w-5" /></div>
              <div>
                <h2 id="profile-title" className="font-semibold text-white">Your Profile</h2>
                <p className="text-xs text-slate-400">Student account details</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Student ID</dt><dd className="text-right font-mono text-slate-200">{loading ? 'Loading...' : studentProfile?.studentId || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Username</dt><dd className="text-right text-slate-200">{loading ? 'Loading...' : studentProfile?.username || '—'}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-400">Email</dt><dd className="max-w-[65%] break-all text-right text-slate-200">{loading ? 'Loading...' : studentProfile?.email || '—'}</dd></div>
            </dl>
          </section>
        </section>

        <section aria-labelledby="catalog-title">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="catalog-title" className="text-xl font-bold text-white">Book Catalog</h2>
              <p className="mt-1 text-sm text-slate-400">Search titles and check current availability.</p>
            </div>
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, author, category..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
              />
            </label>
          </div>

          {loading && books.length === 0 ? (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">Loading catalog...</p>
          ) : filteredBooks.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredBooks.map((book) => {
                const activeRequest = borrowRequests.find((item) => item.bookId === book.id && ['Pending', 'Approved'].includes(item.status));
                const isBorrowed = activeLoans.some((item) => item.bookId === book.id);
                const requestLabel = isBorrowed ? 'Already borrowed'
                  : activeRequest?.status || (book.availableCopies > 0 ? 'Request to Borrow' : 'Unavailable');
                return (
                <article key={book.id} className="flex min-h-48 flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-indigo-700/70">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold leading-5 text-white">{book.title}</h3>
                      <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${book.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{book.author}</p>
                    {book.category && <p className="mt-3 text-xs text-indigo-300">{book.category}</p>}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBook(book)}
                      className="text-sm font-semibold text-indigo-300 transition hover:text-indigo-200"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      disabled={book.availableCopies <= 0 || isBorrowed || Boolean(activeRequest)}
                      onClick={() => requestBook(book.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-400"
                    >
                      {activeRequest?.status === 'Pending' ? <Clock3 className="h-3.5 w-3.5" /> : <BookMarked className="h-3.5 w-3.5" />}
                      {requestLabel}
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
              {books.length ? 'No books match your search.' : 'The catalog is currently empty.'}
            </p>
          )}
        </section>

        <section aria-labelledby="requests-title">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-indigo-300" />
            <h2 id="requests-title" className="text-xl font-bold text-white">Borrowing Requests</h2>
          </div>
          <p className="mb-3 text-sm text-slate-400">Approved requests are not loans yet. Staff issuance moves them to Borrowed Books.</p>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            {borrowRequests.length ? borrowRequests.map((request) => (
              <div key={request.id} className="flex flex-col justify-between gap-3 border-b border-slate-800 p-4 last:border-0 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{request.bookTitle}</p>
                  <p className="mt-1 text-xs text-slate-400">Requested {formatDate(request.requestedAt)}</p>
                </div>
                <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${request.status === 'Approved' || request.status === 'Issued' ? 'bg-emerald-500/10 text-emerald-300' : request.status === 'Rejected' ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-500/10 text-amber-300'}`}>
                  {request.status === 'Rejected' ? <CircleX className="h-3.5 w-3.5" /> : <CircleCheck className="h-3.5 w-3.5" />}
                  {request.status}
                </span>
              </div>
            )) : <p className="p-5 text-sm text-slate-400">{loading ? 'Loading borrowing requests...' : 'Your borrowing requests will appear here.'}</p>}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <div aria-labelledby="loans-title">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-300" />
              <h2 id="loans-title" className="text-xl font-bold text-white">Borrowed Books</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              {activeLoans.length ? activeLoans.map((transaction) => (
                <div key={transaction.id} className="flex flex-col justify-between gap-2 border-b border-slate-800 p-4 last:border-0 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{transaction.bookTitle}</p>
                    <p className="mt-1 text-xs text-slate-400">Borrowed {formatDate(transaction.issueDate)}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <span className="text-xs text-slate-400">Due {formatDate(transaction.dueDate)}</span>
                    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${transaction.status === 'Overdue' ? 'bg-rose-500/10 text-rose-300' : 'bg-indigo-500/10 text-indigo-300'}`}>{transaction.status}</span>
                    <button
                      type="button"
                      onClick={() => handleReturn(transaction)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Return Book
                    </button>
                  </div>
                </div>
              )) : <p className="p-5 text-sm text-slate-400">{loading ? 'Loading your loans...' : 'You have no active loans.'}</p>}
            </div>
          </div>

          <div aria-labelledby="history-title">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-300" />
              <h2 id="history-title" className="text-xl font-bold text-white">Borrowing History</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              {history.length ? history.map((transaction) => (
                <div key={transaction.id} className="flex flex-col justify-between gap-2 border-b border-slate-800 p-4 last:border-0 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{transaction.bookTitle}</p>
                    <p className="mt-1 text-xs text-slate-400">Borrowed {formatDate(transaction.issueDate)} · Due {formatDate(transaction.dueDate)}</p>
                  </div>
                  <div className="text-xs text-slate-400">Returned {formatDate(transaction.returnDate)}</div>
                </div>
              )) : <p className="p-5 text-sm text-slate-400">{loading ? 'Loading borrowing history...' : 'Returned books will appear here.'}</p>}
            </div>
          </div>
        </section>
      </main>

      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && setSelectedBook(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="book-detail-title" className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Book details</p>
                <h2 id="book-detail-title" className="mt-2 text-xl font-bold text-white">{selectedBook.title}</h2>
              </div>
              <button type="button" onClick={() => setSelectedBook(null)} aria-label="Close book details" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <dl className="mt-6 grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
              <dt className="text-slate-400">Author</dt><dd className="text-slate-200">{selectedBook.author}</dd>
              <dt className="text-slate-400">Category</dt><dd className="text-slate-200">{selectedBook.category || '—'}</dd>
              <dt className="text-slate-400">ISBN</dt><dd className="font-mono text-slate-200">{selectedBook.isbn || '—'}</dd>
              <dt className="text-slate-400">Availability</dt><dd className="font-semibold text-emerald-300">{selectedBook.availableCopies} of {selectedBook.totalCopies} available</dd>
              <dt className="text-slate-400">Shelf</dt><dd className="text-slate-200">{selectedBook.shelfLocation || '—'}</dd>
              <dt className="text-slate-400">Description</dt><dd className="whitespace-pre-wrap text-slate-300">{selectedBook.description || 'No description available.'}</dd>
            </dl>
          </section>
        </div>
      )}
      <Toast />
    </div>
  );
};