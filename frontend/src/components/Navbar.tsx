import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, BookOpen, Briefcase, GraduationCap, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import clsx from 'clsx';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/universities', label: 'Universities' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/50'
        : 'bg-transparent'
    )}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center text-black font-black text-sm group-hover:shadow-lg group-hover:shadow-cyan-500/40 transition-all duration-300">
              EJ
            </div>
            <span className="font-bold text-lg hidden lg:block">
              <span className="text-gray-900 dark:text-white">EduJobs</span>
              <span className="gradient-text"> Scholars</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive(link.href)
                    ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-500/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                    className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white dark:bg-gray-900/5"
                    id="notification-bell"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white dark:bg-gray-900/5 border border-gray-200 dark:border-white/10 hover:border-cyan-500/30 transition-all duration-200"
                    id="user-menu-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block max-w-24 truncate">{user?.name}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black animate-slide-up z-50">
                      <div className="p-3 border-b border-gray-200 dark:border-white/10">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium',
                          isAdmin ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300')}>
                          {isAdmin ? '⚡ Admin' : user?.role === 'jobseeker' ? '💼 Jobseeker' : '🎓 Student'}
                        </span>
                      </div>
                      <div className="p-2">
                        {isAdmin ? (
                          <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
                            <Shield size={15} /> Admin Dashboard
                          </Link>
                        ) : (
                          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
                            <User size={15} /> My Dashboard
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-primary py-2 px-5 text-sm">Login</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              id="mobile-menu-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 animate-slide-up">
          <div className="page-container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}
                className={clsx('block px-4 py-3 rounded-lg text-sm font-medium',
                  isActive(link.href) ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-500/10' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5')}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2">
                <Link to="/login" className="btn-primary w-full block text-center py-2.5 text-sm">Login</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
