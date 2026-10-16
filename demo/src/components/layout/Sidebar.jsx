import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { 
  LayoutDashboard, 
  BookMarked, 
  ArrowLeftRight, 
  Users, 
  GraduationCap,
  ReceiptText, 
  BarChart3,
  BookmarkCheck,
  ClipboardList,
  X
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, stats, userRole, auth, borrowRequests } = useLibrary();
  const pendingRequestCount = borrowRequests.filter((request) => request.status === 'Pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false
    },
    {
      id: 'catalog',
      label: 'Book Catalog',
      icon: BookMarked,
      badge: `${stats.totalBooks}`,
      adminOnly: false
    },
    {
      id: 'borrowRequests',
      label: 'Borrow Requests',
      icon: ClipboardList,
      badge: pendingRequestCount ? `${pendingRequestCount} Pending` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300',
      adminOnly: false
    },
    {
      id: 'circulation',
      label: 'Circulation & Issues',
      icon: ArrowLeftRight,
      badge: stats.overdueCount > 0 ? `${stats.overdueCount} Late` : `${stats.activeIssues}`,
      badgeColor: stats.overdueCount > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300',
      adminOnly: false
    },
    {
      id: 'members',
      label: 'Member Directory',
      icon: Users,
      badge: `${stats.totalMembers}`,
      adminOnly: false
    },
    {
      id: 'transactions',
      label: 'Transaction Log',
      icon: ReceiptText,
      badge: null,
      adminOnly: false
    },
    {
      id: 'analytics',
      label: 'Library Analytics',
      icon: BarChart3,
      badge: null,
      adminOnly: false
    },
    {
      id: 'students',
      label: 'Student Management',
      icon: GraduationCap,
      badge: null,
      adminOnly: true
    }
  ];

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || auth.user?.role === 'admin');

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="h-full flex flex-col justify-between py-6 px-4 bg-slate-900 border-r border-slate-800">
      <div className="space-y-6">
        
        {/* Mobile Header Close */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <span>Navigation Menu</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Chip */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium">Logged in</div>
          <div className="text-sm font-semibold text-white flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {auth.user ? `${auth.user.username} • ${auth.user.role}` : userRole === 'admin' ? 'Librarian (Admin)' : 'Student / Member'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mini Quick Stats Card at bottom of sidebar */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-850 to-indigo-950/40 border border-indigo-900/30 text-xs">
        <div className="text-slate-300 font-semibold mb-1 flex items-center justify-between">
          <span>Catalog Summary</span>
          <span className="text-emerald-400 font-bold">{stats.availableCopies} free</span>
        </div>
        <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden mb-2">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ 
              width: stats.totalCopies > 0 ? `${(stats.issuedCopies / stats.totalCopies) * 100}%` : '0%' 
            }}
          />
        </div>
        <div className="flex justify-between text-slate-400 text-[11px]">
          <span>{stats.issuedCopies} Issued</span>
          <span>{stats.totalCopies} Total Copies</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full bg-slate-900 shadow-2xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

