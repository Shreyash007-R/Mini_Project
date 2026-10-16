import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CATEGORIES } from '../../data/initialData';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Star, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin,
  Download
} from 'lucide-react';

export const BookCatalog = ({ onOpenAddBook, onOpenIssueBook, onOpenEditBook, onOpenDetails }) => {
  const { 
    books, 
    deleteBook, 
    searchQuery, 
    setSearchQuery, 
    userRole,
    notify
  } = useLibrary();

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [sortBy, setSortBy] = useState('title-asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (book.title?.toLowerCase() || '').includes(q) ||
          (book.author?.toLowerCase() || '').includes(q) ||
          (book.isbn?.toLowerCase() || '').includes(q);

        // Category filter
        const matchesCategory =
          selectedCategory === 'All Categories' || book.category === selectedCategory;

        // Availability filter
        const matchesAvailability =
          availabilityFilter === 'all' ||
          (availabilityFilter === 'available' && (book.availableCopies || 0) > 0) ||
          (availabilityFilter === 'unavailable' && (book.availableCopies || 0) <= 0);

        return matchesSearch && matchesCategory && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
        if (sortBy === 'year-desc') return (b.publishedYear || 0) - (a.publishedYear || 0);
        if (sortBy === 'year-asc') return (a.publishedYear || 0) - (b.publishedYear || 0);
        if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'copies-desc') return (b.availableCopies || 0) - (a.availableCopies || 0);
        return 0;
      });
  }, [books, searchQuery, selectedCategory, availabilityFilter, sortBy]);

  const exportCatalogToCSV = () => {
    if (filteredBooks.length === 0) {
      notify('No books found to export', 'error');
      return;
    }

    const headers = ['Book ID', 'Title', 'Author', 'ISBN', 'Category', 'Published Year', 'Total Copies', 'Available Copies', 'Shelf Location', 'Rating'];
    const rows = filteredBooks.map((b) => [
      `"${b.id || ''}"`,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      `"${b.isbn || ''}"`,
      `"${b.category || ''}"`,
      `"${b.publishedYear || ''}"`,
      `"${b.totalCopies || 0}"`,
      `"${b.availableCopies || 0}"`,
      `"${b.shelfLocation || ''}"`,
      `"${b.rating || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `library_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Book catalog exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Book Catalog & Inventory</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Showing {filteredBooks.length} of {books.length} titles
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCatalogToCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 border border-slate-750 shadow-sm transition-all"
            title="Download catalog as CSV"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={onOpenAddBook}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          )}
        </div>
      </div>

      {/* Filters, Search & Sort Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        
        {/* Search & Top Controls */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author name, or ISBN..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Availability Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Availability</option>
              <option value="available">In Stock Only</option>
              <option value="unavailable">Out of Stock</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="title-asc">Title (A → Z)</option>
              <option value="title-desc">Title (Z → A)</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="year-desc">Year (Newest First)</option>
              <option value="copies-desc">Most Available</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Card View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Books Match Your Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or clearing your availability filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setAvailabilityFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                className="flex flex-col justify-between rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:-translate-y-1 duration-200 overflow-hidden group"
              >
                {/* Book Cover Banner */}
                <div 
                  onClick={() => onOpenDetails(book)}
                  className="relative h-52 w-full overflow-hidden bg-slate-800 cursor-pointer"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                  {/* Availability Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border shadow-sm ${
                        isAvailable
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                          : 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                      }`}
                    >
                      {isAvailable ? `${book.availableCopies} Available` : 'Issued Out'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 text-amber-300 border border-slate-700/60 backdrop-blur-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{book.rating}</span>
                  </div>

                  {/* Shelf Location Pin */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span className="font-mono">{book.shelfLocation || 'Shelf A'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                      {book.category}
                    </span>
                    <h3 
                      onClick={() => onOpenDetails(book)}
                      className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mt-1 cursor-pointer leading-snug"
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      by {book.author}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Year: {book.publishedYear}</span>
                    <span>Total: {book.totalCopies} copies</span>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onOpenDetails(book)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      Details
                    </button>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onOpenIssueBook(book)}
                        disabled={!isAvailable}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          isAvailable
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-750'
                        }`}
                        title={isAvailable ? 'Issue this book to a member' : 'No copies in stock'}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Issue
                      </button>
                    )}

                    {userRole === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenEditBook(book)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Book Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${book.title}" from catalog?`)) {
                              deleteBook(book.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Book"
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
      ) : (

        /* List / Table Mode */
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Book Title & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Shelf</th>
                  <th className="py-3 px-4">Copies</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;

                  return (
                    <tr key={book.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage}
                            alt=""
                            className="w-9 h-12 rounded object-cover shrink-0 border border-slate-700 bg-slate-800"
                          />
                          <div>
                            <div 
                              onClick={() => onOpenDetails(book)}
                              className="font-bold text-white hover:text-indigo-300 cursor-pointer text-sm"
                            >
                              {book.title}
                            </div>
                            <div className="text-slate-400 text-xs">by {book.author} · ISBN: {book.isbn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60">
                          {book.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{book.shelfLocation || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-semibold">
                        {book.availableCopies} / {book.totalCopies}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            isAvailable
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => onOpenDetails(book)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          Details
                        </button>
                        {userRole === 'admin' && isAvailable && (
                          <button
                            onClick={() => onOpenIssueBook(book)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm"
                          >
                            Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </div>
  );
};
