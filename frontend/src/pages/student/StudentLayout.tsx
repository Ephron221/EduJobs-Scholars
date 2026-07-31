import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bookmark, ClipboardList, Bell, User,
  BookOpen, LogOut, GraduationCap, ChevronRight, Shield, Menu, X, Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssetUrl } from '../../utils/assetUrl';
import { useNotifications } from '../../contexts/NotificationContext';
import ThemeToggle from '../../components/ThemeToggle';
import { motion } from 'framer-motion';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

        {/* User profile overview */}
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <Link to="/dashboard/profile" onClick={closeMobileMenu} className="block rounded-3xl bg-slate-50/50 dark:bg-white/5 p-4 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-cyan-500/20 shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user?.avatar ? (
                  <img src={getAssetUrl(user.avatar)} alt={user.name} className="w-11 h-11 rounded-2xl object-cover border border-cyan-200 dark:border-cyan-500/30 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-black text-base group-hover:scale-105 transition-transform">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 shadow-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-cyan-500 transition-colors">{user?.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate opacity-80 uppercase tracking-tighter">{user?.role}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={closeMobileMenu}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative group',
                  active
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                )}>
                <div className={clsx(
                  'transition-transform duration-300 group-hover:scale-110 group-active:scale-95',
                  active ? 'text-cyan-500' : ''
                )}>
                  {item.icon}
                </div>
                <span className="flex-1">{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center font-black px-1 shadow-lg shadow-red-500/20 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {active && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-r-full" />
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
              <div className="items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hidden sm:flex">
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

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:border-cyan-500/30 transition-all duration-200"
              >
                {user?.avatar ? (
                  <img src={getAssetUrl(user.avatar)} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-black/50 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <span className="text-xs inline-flex items-center px-2 py-1 mt-2 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      {user?.role === 'jobseeker' ? '💼 Jobseeker' : '🎓 Student'}
                    </span>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); logout(); navigate('/'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
