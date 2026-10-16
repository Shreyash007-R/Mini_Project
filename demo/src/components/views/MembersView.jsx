import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  GraduationCap, 
  Trash2, 
  X,
  AlertCircle,
  Edit3,
  Eye,
  BookOpen,
  History,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const MembersView = ({ isAddMemberOpen, onOpenAddMember, onCloseAddMember }) => {
  const { 
    members, 
    addMember, 
    updateMember,
    deleteMember, 
    transactions, 
    userRole 
  } = useLibrary();

  const [search, setSearch] = useState('');
  const [viewingMember, setViewingMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  // New Member Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: 'Computer Science & Engineering',
    phone: '',
  });
  const [formError, setFormError] = useState('');

  // Edit Member Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'Student',
    department: '',
    phone: '',
  });
  const [editFormError, setEditFormError] = useState('');

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim();
    return (
      (m.name?.toLowerCase() || '').includes(q) ||
      (m.email?.toLowerCase() || '').includes(q) ||
      (m.id?.toLowerCase() || '').includes(q) ||
      (m.department?.toLowerCase() || '').includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Member name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email address is required.');
      return;
    }

    addMember(formData);
    setFormData({
      name: '',
      email: '',
      role: 'Student',
      department: 'Computer Science & Engineering',
      phone: '',
    });
    setFormError('');
    onCloseAddMember();
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'Student',
      department: member.department || '',
      phone: member.phone || '',
    });
    setEditFormError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditFormError('Member name is required.');
      return;
    }
    if (!editFormData.email.trim()) {
      setEditFormError('Email address is required.');
      return;
    }

    updateMember(editingMember.id, editFormData);
    setEditingMember(null);
  };

  // Find books currently borrowed by a specific member
  const getMemberActiveBooks = (memberId) => {
    return transactions.filter((t) => t.memberId === memberId && t.status !== 'Returned');
  };

  // Find all transactions for a member
  const getMemberAllTransactions = (memberId) => {
    return transactions.filter((t) => t.memberId === memberId);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Member & Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage library memberships for students, research scholars, and academic faculty
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={onOpenAddMember}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Register New Member
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department, or Member ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Members: <strong className="text-white font-mono">{members.length}</strong>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => {
          const activeBooks = getMemberActiveBooks(member.id);

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all hover:shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div 
                    onClick={() => setViewingMember(member)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900/60 border border-indigo-700/40 flex items-center justify-center font-bold text-indigo-300 text-base shadow-sm group-hover:scale-105 transition-transform">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{member.name}</h3>
                      <span className="text-[11px] font-mono text-indigo-400">{member.id}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      member.role === 'Faculty'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                {/* Contact & Department */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-400">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400">{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Borrowed Books Indicator */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Active Borrowings:</span>
                  <span className="font-semibold text-white">
                    {activeBooks.length} book{activeBooks.length === 1 ? '' : 's'}
                  </span>
                </div>

                {activeBooks.length > 0 && (
                  <div className="space-y-1">
                    {activeBooks.map((t) => (
                      <div
                        key={t.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-750 text-[11px] flex items-center justify-between"
                      >
                        <span className="truncate text-slate-300 max-w-[170px]">{t.bookTitle}</span>
                        <span className="text-rose-400 font-mono shrink-0 ml-1">Due {t.dueDate.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs border-t border-slate-800/60">
                  <button
                    onClick={() => setViewingMember(member)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View History
                  </button>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        title="Edit profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove member ${member.name}?`)) {
                            deleteMember(member.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Member Profile & History Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900/60 border border-indigo-700/40 flex items-center justify-center font-bold text-indigo-300 text-base">
                  {viewingMember.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{viewingMember.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {viewingMember.id} · Member since {viewingMember.joinDate || '2024'}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Member Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                  <div className="text-slate-400">Role</div>
                  <div className="font-semibold text-white mt-0.5">{viewingMember.role}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                  <div className="text-slate-400">Department</div>
                  <div className="font-semibold text-white mt-0.5 truncate">{viewingMember.department}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                  <div className="text-slate-400">Email</div>
                  <div className="font-semibold text-indigo-300 mt-0.5 truncate">{viewingMember.email}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                  <div className="text-slate-400">Phone</div>
                  <div className="font-semibold text-white mt-0.5">{viewingMember.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Transactions Timeline */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-400" />
                  Borrowing History & Slips
                </h3>

                {getMemberAllTransactions(viewingMember.id).length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-850 rounded-xl border border-slate-800">
                    No borrowing activity recorded for this member yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800 rounded-xl bg-slate-850 border border-slate-800 overflow-hidden text-xs">
                    {getMemberAllTransactions(viewingMember.id).map((t) => {
                      const isReturned = t.status === 'Returned';
                      const isOverdue = t.status === 'Overdue';

                      return (
                        <div key={t.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                          <div>
                            <div className="font-bold text-white text-sm">{t.bookTitle}</div>
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              Issued: {t.issueDate} · Due: {t.dueDate}
                              {t.returnDate && ` · Returned: ${t.returnDate}`}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
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
                            {t.fineAmount > 0 && (
                              <div className="text-[11px] text-rose-400 font-medium mt-1">
                                Fine: ₹{t.fineAmount} {t.finePaid ? '(Paid)' : '(Unpaid)'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Member Profile</h2>
                  <p className="text-xs text-slate-400">Update contact and academic credentials</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editFormError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Researcher">Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Program
                </label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Register Member</h2>
                  <p className="text-xs text-slate-400">Add a student or faculty library card</p>
                </div>
              </div>
              <button
                onClick={onCloseAddMember}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="siddharth@college.edu"
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Researcher">Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765-43210"
                    className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Department / Program
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onCloseAddMember}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Register Member
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
