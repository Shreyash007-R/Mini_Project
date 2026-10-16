import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  BookOpen, 
  Search, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle,
  Menu
} from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    auth,
    resetToDemoData, 
    stats,
    logout 
  } = useLibrary();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activeTab !== 'catalog' && e.target.value.trim() !== '') {
      setActiveTab('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  LibroHub
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  LMS v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search catalog by title, author, or ISBN..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-850 text-sm rounded-xl border border-slate-700/70 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 transition-all text-slate-200"
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
          </div>

          {/* Quick Action Badges & Account Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {stats.overdueCount > 0 && (
              <button
                onClick={() => setActiveTab('circulation')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-medium hover:bg-rose-500/25 transition-colors animate-pulse"
                title="View Overdue Issues"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{stats.overdueCount} Overdue</span>
              </button>
            )}

            {auth.user && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-2.5 py-1.5 text-xs text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                  {auth.user.username}
                </span>
                <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-indigo-300">
                  {auth.user.role}
                </span>
              </div>
            )}

            <button
              onClick={resetToDemoData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600 transition-all text-xs font-medium flex items-center gap-1.5"
              title="Refresh library data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Refresh</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 hover:border-slate-600 transition-all text-xs font-medium"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
