import React, { useMemo, useState } from 'react';
import { GraduationCap, Search, UserPlus, Eye, Pencil, UserRoundCheck, UserRoundX, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

const emptyForm = { name: '', studentId: '', username: '', email: '', password: '' };

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const StudentManagementView = () => {
  const { students, addStudent, updateStudent, setStudentActive, getStudentDetails } = useLibrary();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [viewingStudent, setViewingStudent] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) => [student.name, student.studentId, student.username, student.email]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [students, search]);

  const openCreate = () => {
    setEditingStudent(null);
    setFormData(emptyForm);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentId: student.studentId,
      username: student.username,
      email: student.email,
      password: '',
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.studentId.trim() || !formData.username.trim() || !formData.email.trim()) {
      setFormError('Full name, student ID, username, and email are required.');
      return;
    }
    if (!editingStudent && formData.password.length < 12) {
      setFormError('Initial password must be at least 12 characters.');
      return;
    }

    setSaving(true);
    const { password, ...profile } = formData;
    const saved = editingStudent
      ? await updateStudent(editingStudent.id, profile)
      : await addStudent({ ...profile, password });
    setSaving(false);
    if (saved) setIsFormOpen(false);
  };

  const openDetails = async (student) => {
    setViewingStudent({ ...student, transactions: [] });
    setLoadingDetails(true);
    const details = await getStudentDetails(student.id);
    setLoadingDetails(false);
    if (details) setViewingStudent(details);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300"><GraduationCap className="h-4 w-4" /> Accounts</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Student Management</h1>
          <p className="mt-1 text-sm text-slate-400">Create and manage student sign-in accounts.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:self-auto">
          <UserPlus className="h-4 w-4" /> Add Student
        </button>
      </header>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center">
        <label className="relative block w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, student ID, or username" className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none" />
        </label>
        <p className="text-xs text-slate-400">{students.length} student {students.length === 1 ? 'account' : 'accounts'}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredStudents.map((student) => (
          <article key={student.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-700/40 bg-indigo-900/40 text-indigo-200"><GraduationCap className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{student.name}</h2>
                  <p className="mt-0.5 truncate font-mono text-xs text-indigo-300">{student.studentId}</p>
                </div>
              </div>
              <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${student.active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-300'}`}>
                {student.active ? 'Active' : 'Deactivated'}
              </span>
            </div>
            <div className="mt-4 grid gap-2 border-t border-slate-800 pt-4 text-xs sm:grid-cols-2">
              <p className="text-slate-400">Username <span className="ml-1 text-slate-200">{student.username}</span></p>
              <p className="truncate text-slate-400">Email <span className="ml-1 text-slate-200">{student.email}</span></p>
              <p className="text-slate-400">Active loans <span className="ml-1 text-slate-200">{student.borrowedCount}</span></p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-800 pt-3">
              <button type="button" onClick={() => openDetails(student)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 transition hover:text-indigo-200"><Eye className="h-3.5 w-3.5" /> Details & history</button>
              <button type="button" onClick={() => openEdit(student)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-white"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              <button type="button" onClick={() => setStudentActive(student.id, !student.active)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-white">
                {student.active ? <UserRoundX className="h-3.5 w-3.5" /> : <UserRoundCheck className="h-3.5 w-3.5" />}
                {student.active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </article>
        ))}
        {!filteredStudents.length && (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400 xl:col-span-2">
            {students.length ? 'No students match your search.' : 'No student accounts have been created.'}
          </p>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="student-form-title" className="my-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Student account</p>
                <h2 id="student-form-title" className="mt-1 text-xl font-bold text-white">{editingStudent ? 'Edit student' : 'Add student'}</h2>
              </div>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close student form" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              {[
                ['name', 'Full name', 'text'],
                ['studentId', 'Student ID', 'text'],
                ['username', 'Username', 'text'],
                ['email', 'Email', 'email'],
              ].map(([field, label, type]) => (
                <label key={field} className="block text-xs font-semibold text-slate-400">
                  {label}
                  <input type={type} required value={formData[field]} onChange={(event) => setFormData((current) => ({ ...current, [field]: event.target.value }))} autoComplete={field === 'username' ? 'username' : undefined} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                </label>
              ))}
              {!editingStudent && (
                <label className="block text-xs font-semibold text-slate-400 sm:col-span-2">
                  Initial password
                  <input type="password" required minLength={12} autoComplete="new-password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                  <span className="mt-1 block font-normal text-slate-500">At least 12 characters. Share the credentials directly with the student.</span>
                </label>
              )}
              {formError && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 sm:col-span-2">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving...' : editingStudent ? 'Save changes' : 'Create account'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="student-details-title" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Student profile</p>
                <h2 id="student-details-title" className="mt-1 text-xl font-bold text-white">{viewingStudent.name}</h2>
              </div>
              <button type="button" onClick={() => setViewingStudent(null)} aria-label="Close student details" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <dl className="mt-5 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-400">Student ID</dt><dd className="mt-1 font-mono text-slate-200">{viewingStudent.studentId}</dd></div>
              <div><dt className="text-xs text-slate-400">Username</dt><dd className="mt-1 text-slate-200">{viewingStudent.username}</dd></div>
              <div><dt className="text-xs text-slate-400">Email</dt><dd className="mt-1 break-all text-slate-200">{viewingStudent.email}</dd></div>
              <div><dt className="text-xs text-slate-400">Status</dt><dd className="mt-1 text-slate-200">{viewingStudent.active ? 'Active' : 'Deactivated'}</dd></div>
            </dl>
            <h3 className="mt-6 font-semibold text-white">Borrowing records</h3>
            {loadingDetails ? <p className="mt-3 text-sm text-slate-400">Loading borrowing history...</p> : viewingStudent.transactions?.length ? (
              <div className="mt-3 divide-y divide-slate-800 rounded-xl border border-slate-800">
                {viewingStudent.transactions.map((transaction) => (
                  <div key={transaction.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <span className="font-medium text-slate-200">{transaction.bookTitle}</span>
                    <span className="text-xs text-slate-400">Due {formatDate(transaction.dueDate)}</span>
                    <span className={`text-xs font-semibold ${transaction.status === 'Overdue' ? 'text-rose-300' : 'text-slate-300'}`}>{transaction.status}{transaction.returnDate ? ` · Returned ${formatDate(transaction.returnDate)}` : ''}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">No borrowing records.</p>}
          </section>
        </div>
      )}
    </div>
  );
};