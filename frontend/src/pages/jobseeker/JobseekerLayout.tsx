import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bookmark, ClipboardList, Bell, User,
  BookOpen, LogOut, GraduationCap, ChevronRight, Shield, Menu, X, Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import ThemeToggle from '../../components/ThemeToggle';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { href: '/dashboard/saved', label: 'Saved', icon: <Bookmark size={18} /> },
  { href: '/dashboard/applications', label: 'Applications', icon: <ClipboardList size={18} /> },
  { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <User size={18} /> },
];

export default function StudentLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "w-64 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/5 fixed left-0 top-0 h-full z-50 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center text-black font-black text-sm">EJ</div>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">EduJobs</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Scholars</div>
            </div>
          </Link>
          <button onClick={closeMobileMenu} className="md:hidden p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={closeMobileMenu}
                className={active ? 'sidebar-item-active' : 'sidebar-item'}>
                {item.icon}
                {item.label}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-gray-900 dark:text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5 space-y-1">
          <Link to="/guidance" className="sidebar-item" onClick={closeMobileMenu}>
            <BookOpen size={18} /> Guidance Resources
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:flex">
                {user?.role === 'jobseeker' ? <Briefcase size={12} /> : <GraduationCap size={12} />}
                <span>{user?.role === 'jobseeker' ? 'Jobseeker Dashboard' : 'Student Dashboard'}</span>
                <ChevronRight size={10} />
                <span className="text-gray-600 dark:text-gray-400">{title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-cyan-400 transition-colors hidden sm:block">← Public Site</Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
