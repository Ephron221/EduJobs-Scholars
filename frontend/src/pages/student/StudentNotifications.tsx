import { Bell, CheckCheck, AlertCircle, Megaphone, Briefcase, BookOpen, Info, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import StudentLayout from './StudentLayout';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const typeConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  deadline: { icon: <AlertCircle size={20} />, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Urgent Alert' },
  new_opportunity: { icon: <Briefcase size={20} />, color: 'text-green-500', bg: 'bg-green-500/10', label: 'New Opportunity' },
  announcement: { icon: <Megaphone size={20} />, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Broadcast' },
  status_update: { icon: <BookOpen size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Step Update' },
  system: { icon: <Info size={20} />, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'System' },
};

export default function StudentNotifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <StudentLayout title="Notifications Center">
      <div className="space-y-6 pb-10">

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900/40 p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
               <Bell size={24} />
            </div>
            <div>
               <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">Inbox</h2>
               <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{notifications.length} Total</span>
                  {unreadCount > 0 && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      <span className="text-[10px] font-black uppercase text-red-500 tracking-widest animate-pulse">{unreadCount} Unread</span>
                    </>
                  )}
               </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={markAllRead}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
            >
              <CheckCheck size={14} /> Clear All Unread
            </motion.button>
          )}
        </div>

        {notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-32 glass-card border-dashed">
            <div className="relative inline-block mb-6">
               <Bell size={64} className="text-gray-200 dark:text-gray-800" />
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full border-4 border-white dark:border-gray-900" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No Notifications Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">We'll let you know when there's an update on your applications or new opportunities.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((n, idx) => {
                const config = typeConfig[n.type] || typeConfig.system;
                return (
                  <motion.div
                    key={n._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={clsx(
                      'glass-card p-5 cursor-pointer group relative overflow-hidden transition-all duration-300',
                      n.isRead ? 'border-gray-100 dark:border-white/5 opacity-80 grayscale-[0.5]' : 'border-cyan-500/30 shadow-xl hover:border-cyan-500 shadow-cyan-500/5'
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                    )}

                    <div className="flex items-start gap-5">
                      <div className={clsx("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", config.bg, config.color)}>
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                           <div className="min-w-0">
                              <span className={clsx("text-[9px] font-black uppercase tracking-[0.2em] mb-1 block", config.color)}>{config.label}</span>
                              <h3 className={clsx('font-black text-base leading-tight uppercase tracking-tight transition-colors', n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-cyan-500')}>{n.title}</h3>
                           </div>
                           {!n.isRead && (
                             <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 mt-1 shrink-0 animate-pulse" />
                           )}
                        </div>

                        <p className={clsx("text-sm mt-3 leading-relaxed font-medium", n.isRead ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300')}>
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
                           <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                           </div>
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[9px] font-black uppercase text-cyan-500">
                              Mark as read <ArrowRight size={10} />
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
