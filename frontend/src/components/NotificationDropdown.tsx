import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, BookOpen, Briefcase, Megaphone, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface Props { onClose: () => void; }

const typeIcon = (type: string) => {
  switch (type) {
    case 'deadline': return <AlertCircle size={14} className="text-red-400" />;
    case 'new_opportunity': return <Briefcase size={14} className="text-green-400" />;
    case 'announcement': return <Megaphone size={14} className="text-cyan-400" />;
    case 'status_update': return <BookOpen size={14} className="text-cyan-300" />;
    default: return <Info size={14} className="text-gray-600 dark:text-gray-400" />;
  }
};

export default function NotificationDropdown({ onClose }: Props) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const recent = notifications.slice(0, 8);
  const hasUnread = recent.some((n) => !n.isRead);

  return (
    <div ref={ref} className="absolute right-0 top-12 w-80 glass-card border border-gray-200 dark:border-gray-200 dark:border-white/10 shadow-2xl shadow-black animate-slide-in-right z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-cyan-400" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
        </div>
        {hasUnread && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="p-6 text-center">
            <Bell size={32} className="text-gray-700 dark:text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          recent.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={clsx(
                'px-4 py-3 border-b border-gray-100 dark:border-white/5 cursor-pointer transition-all hover:bg-white dark:bg-gray-900/5',
                !n.isRead && 'bg-cyan-500/5 border-l-2 border-l-cyan-500'
              )}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('text-sm font-medium truncate', n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-200 dark:border-white/10">
        <Link to="/dashboard/notifications" onClick={onClose}
          className="block text-center text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
