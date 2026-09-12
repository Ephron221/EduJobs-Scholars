import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, BookOpen, Briefcase, Megaphone, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface Props {
  onClose: () => void;
}

const typeIcon = (type: string) => {
  switch (type) {
    case 'deadline':
      return <AlertCircle size={15} className="text-red-500" />;
    case 'new_opportunity':
      return <Briefcase size={15} className="text-green-500" />;
    case 'announcement':
      return <Megaphone size={15} className="text-cyan-500" />;
    case 'status_update':
      return <BookOpen size={15} className="text-blue-500" />;
    case 'system':
      return <MessageSquare size={15} className="text-purple-500" />;
    default:
      return <Info size={15} className="text-gray-500" />;
  }
};

export default function NotificationDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const recent = notifications.slice(0, 10);
  const hasUnread = recent.some((n) => !n.isRead);

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      markRead(n._id);
    }
    onClose();

    // Direct navigation to page or activity
    if (n.link && n.link.trim()) {
      navigate(n.link);
      return;
    }

    if (n.type === 'status_update') {
      navigate(user?.role === 'student' ? '/dashboard/applications' : '/admin/assistance-requests');
    } else if (n.type === 'new_opportunity') {
      navigate('/universities');
    } else if (n.type === 'deadline') {
      navigate('/universities');
    } else if (n.type === 'system') {
      navigate(user?.role === 'student' ? '/dashboard/messages' : '/admin/messages');
    } else {
      navigate(user?.role === 'student' ? '/dashboard/notifications' : '/admin/announcements');
    }
  };

  const allNotificationsLink = user?.role === 'student' ? '/dashboard/notifications' : '/admin/announcements';

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-84 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl animate-slide-in-right z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-cyan-600 dark:text-cyan-400" />
          <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications & Activities</span>
        </div>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
        {recent.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-0.5">All updates and activities will show here.</p>
          </div>
        ) : (
          recent.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={clsx(
                'px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start gap-3',
                !n.isRead ? 'bg-cyan-50/40 dark:bg-cyan-950/20 border-l-3 border-l-cyan-500' : 'opacity-80'
              )}
            >
              <div className="mt-1 shrink-0 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className={clsx('text-xs font-bold truncate', !n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                    {n.title}
                  </p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                  <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">Click to view →</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
        <Link
          to={allNotificationsLink}
          onClick={onClose}
          className="block text-center text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-bold transition-colors"
        >
          View all notifications center →
        </Link>
      </div>
    </div>
  );
}
