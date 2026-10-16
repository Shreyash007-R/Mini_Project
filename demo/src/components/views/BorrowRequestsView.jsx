import React, { useState } from 'react';
import { BookCopy, Check, ClipboardList, Clock3, Search, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

const statusStyles = {
  Pending: 'bg-amber-500/10 text-amber-300',
  Approved: 'bg-emerald-500/10 text-emerald-300',
  Rejected: 'bg-rose-500/10 text-rose-300',
  Issued: 'bg-indigo-500/10 text-indigo-300',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const BorrowRequestsView = () => {
  const { borrowRequests, reviewBorrowRequest } = useLibrary();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Pending');
  const [processingId, setProcessingId] = useState(null);
  const pendingCount = borrowRequests.filter((request) => request.status === 'Pending').length;
  const filteredRequests = borrowRequests.filter((request) => {
    const matchesFilter = filter === 'All' || request.status === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [request.bookTitle, request.memberName, request.studentId]
      .some((value) => value?.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const handleAction = async (requestId, action) => {
    setProcessingId(requestId);
    await reviewBorrowRequest(requestId, action);
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
            <ClipboardList className="h-4 w-4" /> Circulation
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Borrow Requests</h1>
          <p className="mt-1 text-sm text-slate-400">Review student requests and issue approved books.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300">
          <Clock3 className="h-4 w-4" /> {pendingCount} pending
        </span>
      </header>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search book, student, or ID"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter requests by status"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          {['Pending', 'Approved', 'Rejected', 'Issued', 'All'].map((status) => (
            <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {filteredRequests.length ? filteredRequests.map((request) => (
          <article key={request.id} className="flex flex-col gap-4 border-b border-slate-800 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="rounded-lg border border-indigo-700/40 bg-indigo-900/40 p-2 text-indigo-200">
                <BookCopy className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-white">{request.bookTitle}</h2>
                <p className="mt-1 text-xs text-slate-400">{request.memberName} <span className="text-slate-600">·</span> {request.studentId}</p>
                <p className="mt-1 text-xs text-slate-500">Requested {formatDate(request.requestedAt)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${statusStyles[request.status] || 'bg-slate-700 text-slate-300'}`}>
                {request.status}
              </span>
              {request.status === 'Pending' && (
                <>
                  <button type="button" disabled={processingId === request.id} onClick={() => handleAction(request.id, 'approve')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button type="button" disabled={processingId === request.id} onClick={() => handleAction(request.id, 'reject')} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-50">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </>
              )}
              {request.status === 'Approved' && (
                <button type="button" disabled={processingId === request.id} onClick={() => handleAction(request.id, 'issue')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50">
                  <BookCopy className="h-3.5 w-3.5" /> Issue book
                </button>
              )}
            </div>
          </article>
        )) : (
          <p className="p-6 text-sm text-slate-400">{borrowRequests.length ? 'No requests match these filters.' : 'There are no borrowing requests yet.'}</p>
        )}
      </div>
    </div>
  );
};