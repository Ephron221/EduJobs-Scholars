import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BookOpen, Briefcase, Users, User,
  ClipboardList, Bell, FileText, LogOut, ChevronRight, Shield, Home, MessageSquare, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAssetUrl } from '../../utils/assetUrl';
import ThemeToggle from '../../components/ThemeToggle';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard size={17} />, exact: true },
  { href: '/admin/universities', label: 'Universities', icon: <GraduationCap size={17} /> },
  { href: '/admin/programs', label: 'Programs', icon: <BookOpen size={17} /> },
  { href: '/admin/jobs', label: 'Jobs', icon: <Briefcase size={17} /> },
  { href: '/admin/assistance-requests', label: 'Assistance Requests', icon: <ClipboardList size={17} /> },
  { href: '/admin/student-records', label: 'Student Records', icon: <ClipboardList size={17} /> },
  { href: '/admin/users', label: 'Users', icon: <Users size={17} /> },
  { href: '/admin/guidance', label: 'Guidance', icon: <FileText size={17} /> },
  { href: '/admin/messages', label: 'Inquiries', icon: <MessageSquare size={17} /> },
  { href: '/admin/announcements', label: 'Announcements', icon: <Bell size={17} /> },
  { href: '/admin/hero-images', label: 'Hero Images', icon: <Home size={17} /> },
  { href: '/admin/success-stories', label: 'Success Stories', icon: <User size={17} /> },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.href : location.pathname === item.href;

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
          "w-64 md:w-60 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-white/5 fixed left-0 top-0 h-full z-50 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center text-black font-black text-sm">EJ</div>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">Admin Panel</div>
              <div className="text-xs text-cyan-400 flex items-center gap-1"><Shield size={10} /> EduJobs Scholars</div>
            </div>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} onClick={closeMobileMenu}
              className={isActive(item) ? 'sidebar-item-active' : 'sidebar-item'}>
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5 space-y-0.5">
          <Link to="/" className="sidebar-item">
            <Home size={17} /> Public Site
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="sidebar-item w-full text-red-400 hover:bg-red-500/10">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
              <div className="items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:flex">
                <Shield size={11} className="text-cyan-500" />
                <span>Admin</span>
                <ChevronRight size={10} />
                <span className="text-gray-600 dark:text-gray-400">{title}</span>
              </div>
            </div>
          </div>
          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:border-cyan-500/30 transition-all duration-200"
              >
                {user?.avatar ? (
                  <img src={getAssetUrl(user.avatar)} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start truncate">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-xl shadow-gray-200/50 dark:shadow-black/50 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-white/10">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <span className="text-xs inline-flex items-center px-2 py-1 mt-2 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
                      ⚡ Administrator
                    </span>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/admin/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all"
                    >
                      <User size={16} /> Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
