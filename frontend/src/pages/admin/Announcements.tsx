import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Send, Megaphone, AlertCircle, Info, Trash2,
  Search, Filter, History, PlusCircle, Pencil, ChevronLeft,
  ChevronRight, LayoutGrid, CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import { notificationAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const TYPES = [
  { value: 'announcement', label: 'Announcement', icon: <Megaphone size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { value: 'new_opportunity', label: 'New Opportunity', icon: <Bell size={16} />, color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'deadline', label: 'Deadline Alert', icon: <AlertCircle size={16} />, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'system', label: 'System Message', icon: <Info size={16} />, color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isGlobal: boolean;
  createdAt: string;
}

export default function Announcements() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sending, setSending] = useState(false);

  // History State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, announcement: 0, new_opportunity: 0, deadline: 0, system: 0 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit State
  const [editItem, setEditItem] = useState<Notification | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await notificationAPI.getStats();
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAdminAll({
        search,
        type: filterType || undefined,
        page,
        limit: 10
      });
      setNotifications(res.data.notifications);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load history');
    }
    setLoading(false);
  }, [search, filterType, page]);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchHistory, fetchStats]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error('Please fill in title and message'); return; }
    setSending(true);
    try {
      if (editItem) {
        await notificationAPI.update(editItem._id, { title, message, type });
        toast.success('Announcement updated! 🚀');
        setEditItem(null);
      } else {
        await notificationAPI.createAnnouncement({ title, message, type });
        toast.success('Announcement sent to all users! 📣');
      }
      setTitle(''); setMessage(''); setType('announcement');
      fetchStats();
      if (activeTab === 'history') fetchHistory();
      else setActiveTab('history');
    } catch {
      toast.error(editItem ? 'Failed to update announcement' : 'Failed to send announcement');
    }
    setSending(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.delete(id);
      toast.success('Notification deleted');
      setDeleteId(null);
      fetchStats();
      fetchHistory();
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const startEdit = (item: Notification) => {
    setEditItem(item);
    setTitle(item.title);
    setMessage(item.message);
    setType(item.type);
    setActiveTab('compose');
  };

  const selectedTypeInfo = TYPES.find((t) => t.value === type);

  return (
    <AdminLayout title="Announcements">
      <div className="space-y-8">

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-4 flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Sent</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stats.total}</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500"><History size={16} /></div>
            </div>
          </div>
          {TYPES.map(t => (
            <div key={t.value}
              onClick={() => { setFilterType(t.value); setActiveTab('history'); setPage(1); }}
              className={clsx(
                "glass-card p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]",
                filterType === t.value && "ring-2 ring-cyan-500/50 bg-cyan-500/5"
              )}
            >
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest truncate">{t.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className={clsx("text-3xl font-black leading-none", t.color)}>{(stats as any)[t.value] || 0}</span>
                <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", t.bg, t.color)}>{t.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl w-fit border border-gray-200 dark:border-white/5 shadow-inner">
          <button
            onClick={() => { setActiveTab('compose'); setEditItem(null); if(!editItem) { setTitle(''); setMessage(''); setType('announcement'); } }}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              activeTab === 'compose' ? "bg-white dark:bg-gray-800 text-cyan-500 shadow-md scale-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-white scale-95"
            )}
          >
            <PlusCircle size={14} /> {editItem ? 'Edit Message' : 'Compose'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              activeTab === 'history' ? "bg-white dark:bg-gray-800 text-cyan-500 shadow-md scale-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-white scale-95"
            )}
          >
            <History size={14} /> History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'compose' ? (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid lg:grid-cols-[1fr_400px] gap-8"
            >
              {/* Compose Form */}
              <div className="glass-card p-8 border-cyan-500/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <Megaphone className="text-cyan-500" size={24} />
                    {editItem ? 'Update Announcement' : 'Send New Broadcast'}
                  </h2>
                  {editItem && (
                    <button
                      onClick={() => { setEditItem(null); setTitle(''); setMessage(''); setType('announcement'); }}
                      className="text-[10px] font-black uppercase text-red-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSend} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Message Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {TYPES.map((t) => (
                        <button
                          key={t.value} type="button" onClick={() => setType(t.value)}
                          className={clsx(
                            'flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-xs font-bold text-center',
                            type === t.value
                              ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-500 hover:border-cyan-500/30'
                          )}
                        >
                          <span className={clsx("transition-colors", type === t.value ? 'text-white' : t.color)}>{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Notification Title *</label>
                    <input
                      type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. New University Applications Open!"
                      className="input-field py-4 text-sm font-bold" required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Full Message *</label>
                    <textarea
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      rows={6} className="input-field resize-none py-4 text-sm leading-relaxed"
                      placeholder="Students will see this in their notifications..." required
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-[10px] font-black uppercase text-gray-400">{message.length} / 500 characters</p>
                      {message.length > 450 && <p className="text-[10px] font-black uppercase text-amber-500 animate-pulse">Running out of space</p>}
                    </div>
                  </div>

                  <button
                    type="submit" disabled={sending}
                    className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    {sending ? (
                      <><div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> Processing...</>
                    ) : (
                      editItem ? <><Pencil size={18} /> Update Notification</> : <><Send size={18} /> Broadcast to Everyone</>
                    )}
                  </button>
                </form>
              </div>

              {/* Preview & Tips */}
              <div className="space-y-6">
                <div className="glass-card p-6 border-amber-500/10 bg-amber-500/[0.02]">
                   <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                     <ShieldCheck size={14} /> Admin Guidelines
                   </h3>
                   <ul className="space-y-3">
                     {[
                       'Keep titles short and impactful.',
                       'Be clear about deadlines and links.',
                       'Urgent alerts should use the Deadline type.',
                       'System messages are for internal updates.'
                     ].map((tip, i) => (
                       <li key={i} className="flex gap-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1 shrink-0" />
                         {tip}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="glass-card p-6 border-cyan-500/10 overflow-hidden">
                  <h3 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-5 flex items-center gap-2">
                    <LayoutGrid size={14} /> Live Preview
                  </h3>
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-xl">
                      <div className="flex items-start gap-4">
                        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner', selectedTypeInfo?.bg || 'bg-gray-100')}>
                          <span className={selectedTypeInfo?.color || 'text-gray-400'}>
                            {selectedTypeInfo?.icon || <Bell size={24} />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start">
                             <p className="text-[10px] font-black uppercase text-cyan-500 tracking-tighter mb-1">{selectedTypeInfo?.label || 'General'}</p>
                             <span className="text-[8px] font-bold text-gray-400">Just Now</span>
                          </div>
                          <h4 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                            {title || 'Your Notification Title'}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3 font-medium">
                            {message || 'Type your message on the left to see how it will appear to students on their dashboard...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest">Student Dashboard Appearance</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                 <div className="flex-1 min-w-[300px] relative group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input
                      type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search sent messages..."
                      className="input-field pl-12 py-3.5 text-sm font-bold bg-white dark:bg-gray-900"
                    />
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5">
                       <Filter size={14} className="text-gray-400" />
                       <select
                         value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                         className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 text-gray-600 dark:text-gray-400 outline-none"
                       >
                         <option value="">All Types</option>
                         {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              {/* History Table */}
              {loading ? <div className="py-20"><Loader /></div> : (
                <div className="glass-card overflow-hidden border-gray-100 dark:border-white/5 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-white/5">
                          <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Content</th>
                          <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Type</th>
                          <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                          <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                        {notifications.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-20 text-center">
                              <History size={48} className="mx-auto text-gray-200 dark:text-gray-800 mb-4" />
                              <p className="text-sm font-bold text-gray-400">No sent messages found in history.</p>
                            </td>
                          </tr>
                        ) : (
                          notifications.map((n) => {
                            const typeInfo = TYPES.find(t => t.value === n.type) || TYPES[0];
                            return (
                              <tr key={n._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-5">
                                  <div className="min-w-0 max-w-md">
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{n.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 font-medium leading-relaxed">{n.message}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                   <div className={clsx("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", typeInfo.bg, typeInfo.color, "border-transparent")}>
                                      {typeInfo.icon}
                                      {typeInfo.label}
                                   </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{format(new Date(n.createdAt), 'MMM dd, yyyy')}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(n.createdAt), 'hh:mm aa')}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-right whitespace-nowrap">
                                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => startEdit(n)}
                                        className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
                                        title="Edit this message"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                      <button
                                        onClick={() => setDeleteId(n._id)}
                                        className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Delete message"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                   </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {Math.ceil(total / 10) > 1 && (
                    <div className="px-6 py-5 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                         Showing {notifications.length} of {total} messages
                       </p>
                       <div className="flex items-center gap-2">
                          <button
                            disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 disabled:opacity-30 text-gray-600 dark:text-gray-400 hover:text-cyan-500 transition-all shadow-sm"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-black text-gray-900 dark:text-white px-3">Page {page}</span>
                          <button
                            disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/5 disabled:opacity-30 text-gray-600 dark:text-gray-400 hover:text-cyan-500 transition-all shadow-sm"
                          >
                            <ChevronRight size={16} />
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Deletion" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Are you absolutely sure?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            This will permanently delete this notification. Users will no longer see it in their inbox.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            <button onClick={() => setDeleteId(null)} className="btn-secondary py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
            <button onClick={() => deleteId && handleDelete(deleteId)} className="btn-danger py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20">Delete Forever</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
