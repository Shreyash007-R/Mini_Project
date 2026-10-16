import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';

export const ReceiptModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header Controls (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Official Circulation Slip</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-8 bg-slate-900 text-slate-100 print:bg-white print:text-black">
          
          {/* Slip Header */}
          <div className="text-center border-b border-slate-800 print:border-black pb-4 mb-4">
            <div className="text-xs uppercase tracking-widest font-bold text-indigo-400 print:text-gray-700">
              Department of Library & Information Services
            </div>
            <h1 className="text-xl font-black tracking-tight text-white print:text-black mt-1">
              LIBROHUB CENTRAL LIBRARY
            </h1>
            <p className="text-[11px] text-slate-400 print:text-gray-600">
              College Campus · Academic Year 2026-2027 · Automated Circulation Counter
            </p>
          </div>

          {/* Barcode & Reference */}
          <div className="flex items-center justify-between py-2 text-xs border-b border-slate-800/80 print:border-gray-300">
            <div>
              <span className="text-slate-400 print:text-gray-600">Slip No: </span>
              <strong className="font-mono text-white print:text-black">{transaction.id}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-600">Date: </span>
              <strong className="text-white print:text-black">{transaction.issueDate}</strong>
            </div>
          </div>

          {/* Main Details Table */}
          <div className="my-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-850/80 print:bg-gray-100 border border-slate-800 print:border-gray-300 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500">
                Borrower Information
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Member Name:</span>
                <strong className="text-white print:text-black">{transaction.memberName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Member ID:</span>
                <span className="font-mono text-indigo-300 print:text-black">{transaction.memberId}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/80 print:bg-gray-100 border border-slate-800 print:border-gray-300 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500">
                Book Item Details
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Book Title:</span>
                <strong className="text-white print:text-black text-right max-w-[240px] truncate">
                  {transaction.bookTitle}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Accession / Book ID:</span>
                <span className="font-mono text-slate-300 print:text-black">{transaction.bookId}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-850/80 print:bg-gray-100 border border-slate-800 print:border-gray-300 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 print:text-gray-500">
                Circulation Timeline & Fines
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Date of Issue:</span>
                <span className="text-slate-200 print:text-black">{transaction.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-gray-600">Due Return Date:</span>
                <strong className="text-rose-400 print:text-black">{transaction.dueDate}</strong>
              </div>
              {transaction.returnDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Actual Return Date:</span>
                  <span className="text-emerald-400 print:text-black">{transaction.returnDate}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-750 print:border-gray-300">
                <span className="text-slate-400 print:text-gray-600">Status:</span>
                <span className="font-semibold text-white print:text-black uppercase text-[11px]">
                  {transaction.status}
                </span>
              </div>
              {transaction.fineAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-gray-600">Overdue Fine:</span>
                  <strong className="text-rose-400 print:text-black">
                    ₹{transaction.fineAmount} {transaction.finePaid ? '(Settled)' : '(Pending)'}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Barcode Decoration */}
          <div className="py-2 text-center border-t border-b border-slate-800 print:border-gray-400 my-4">
            <div className="font-mono text-xs tracking-[0.3em] text-slate-400 print:text-gray-700 select-none">
              ||| | |||| || ||||| | ||| |||| | ||
            </div>
            <div className="text-[10px] text-slate-500 print:text-gray-500 font-mono mt-0.5">
              *{transaction.id}*
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 flex justify-between items-end text-[11px] text-slate-400 print:text-gray-600">
            <div>
              <div className="w-28 border-b border-slate-600 print:border-black mb-1"></div>
              <span>Borrower Signature</span>
            </div>
            <div className="text-right">
              <div className="w-28 border-b border-slate-600 print:border-black mb-1 ml-auto"></div>
              <span>Librarian Stamp</span>
            </div>
          </div>

          {/* Rules Footnote */}
          <p className="mt-6 text-[10px] text-slate-500 print:text-gray-500 text-center leading-tight">
            Please return items by the due date to avoid fines. Damaged or lost books must be reported immediately to the library desk.
          </p>

        </div>

        {/* Footer (No print) */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Slip
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
};
