import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CATEGORIES } from '../../data/initialData';
import { X, BookPlus, Sparkles } from 'lucide-react';

const COVER_PRESETS = [
  { label: 'CS / Algorithms', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600' },
  { label: 'Code & Tech', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600' },
  { label: 'AI & Data', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600' },
  { label: 'Database', url: 'https://images.unsplash.com/photo-1507842229451-79b1be8d6290?auto=format&fit=crop&q=80&w=600' },
  { label: 'Classic Library', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600' },
];

const BookModalContent = ({ onClose, bookToEdit = null }) => {
  const { addBook, updateBook } = useLibrary();

  const [formData, setFormData] = useState(() => {
    if (bookToEdit) {
      return {
        title: bookToEdit.title || '',
        author: bookToEdit.author || '',
        isbn: bookToEdit.isbn || '',
        category: bookToEdit.category || 'Computer Science',
        publishedYear: bookToEdit.publishedYear || new Date().getFullYear(),
        totalCopies: bookToEdit.totalCopies || 1,
        shelfLocation: bookToEdit.shelfLocation || 'A-101',
        rating: bookToEdit.rating || 4.5,
        description: bookToEdit.description || '',
        coverImage: bookToEdit.coverImage || COVER_PRESETS[0].url,
      };
    }
    return {
      title: '',
      author: '',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Computer Science',
      publishedYear: new Date().getFullYear(),
      totalCopies: 5,
      shelfLocation: `A-${Math.floor(100 + Math.random() * 900)}`,
      rating: 4.5,
      description: '',
      coverImage: COVER_PRESETS[0].url,
    };
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Book title is required';
    if (!formData.author.trim()) errs.author = 'Author name is required';
    if (!formData.isbn.trim()) errs.isbn = 'ISBN is required';
    if (!formData.totalCopies || formData.totalCopies < 1) errs.totalCopies = 'At least 1 copy required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (bookToEdit) {
      updateBook(bookToEdit.id, formData);
    } else {
      addBook(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {bookToEdit ? 'Edit Book Information' : 'Add New Book to Catalog'}
              </h2>
              <p className="text-xs text-slate-400">Enter title, author, copies, and inventory details</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Book Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Artificial Intelligence: A Modern Approach"
              className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl border text-sm text-white focus:outline-none focus:ring-1 ${
                errors.title ? 'border-rose-500 ring-rose-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* Author & ISBN Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Author(s) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Stuart Russell, Peter Norvig"
                className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.author ? 'border-rose-500 ring-rose-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.author && <p className="mt-1 text-xs text-rose-400">{errors.author}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                ISBN Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="978-0136042594"
                className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.isbn ? 'border-rose-500 ring-rose-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.isbn && <p className="mt-1 text-xs text-rose-400">{errors.isbn}</p>}
            </div>
          </div>

          {/* Category & Published Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Publication Year
              </label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Copies & Shelf Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Copies <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className={`w-full px-3.5 py-2 bg-slate-800 rounded-xl border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.totalCopies ? 'border-rose-500 ring-rose-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {errors.totalCopies && <p className="mt-1 text-xs text-rose-400">{errors.totalCopies}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Shelf Location
              </label>
              <input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="e.g. B-204"
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rating (1 - 5)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of the book content and syllabus mapping..."
              className="w-full px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />
          </div>

          {/* Cover Image URL & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Cover Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = COVER_PRESETS[0].url;
                  }}
                />
              </div>
            </div>

            {/* Quick preset pickers */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Presets:
              </span>
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
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
              className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              {bookToEdit ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export const BookModal = ({ isOpen, onClose, bookToEdit = null }) => {
  if (!isOpen) return null;

  return (
    <BookModalContent
      key={bookToEdit ? bookToEdit.id : 'new-book'}
      onClose={onClose}
      bookToEdit={bookToEdit}
    />
  );
};
