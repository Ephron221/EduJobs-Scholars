import { Bell, CheckCheck, AlertCircle, Megaphone, Briefcase, BookOpen, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import StudentLayout from './StudentLayout';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const typeIcon = (type: string) => {
  switch (type) {
    case 'deadline': return <AlertCircle size={18} className="text-red-400" />;
    case 'new_opportunity': return <Briefcase size={18} className="text-green-400" />;
    case 'announcement': return <Megaphone size={18} className="text-cyan-400" />;
    case 'status_update': return <BookOpen size={18} className="text-blue-400" />;
    default: return <Info size={18} className="text-gray-600 dark:text-gray-400" />;
  }
};

const typeBg: Record<string, string> = {
  deadline: 'bg-red-500/10 border-red-500/20',
  new_opportunity: 'bg-green-500/10 border-green-500/20',
  announcement: 'bg-cyan-500/10 border-cyan-500/20',
  status_update: 'bg-blue-500/10 border-blue-500/20',
  system: 'bg-gray-500/10 border-gray-500/20',
};

export default function StudentNotifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <StudentLayout title="Notifications">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-cyan-400" />
          <span className="text-gray-900 dark:text-white font-semibold">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-gray-900 dark:text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} unread</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Bell size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 dark:text-white font-semibold mb-2">No Notifications</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">You'll be notified about deadlines, new opportunities, and updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={clsx(
                'glass-card p-5 cursor-pointer transition-all hover:bg-white dark:hover:bg-gray-800/50 flex items-start gap-4 border',
                n.isRead ? 'border-gray-100 dark:border-white/5 opacity-70' : 'border-cyan-500/20',
                typeBg[n.type] || 'bg-white dark:bg-gray-900/3 border-gray-100 dark:border-white/5'
              )}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-black/30">
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={clsx('font-semibold text-sm', n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white')}>{n.title}</h3>
                  {!n.isRead && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 mt-1 animate-pulse" />}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{n.message}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  <span className="ml-2 capitalize text-gray-700 dark:text-gray-300">· {n.type.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
