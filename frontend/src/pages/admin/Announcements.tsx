import { useState } from 'react';
import { Bell, Send, Megaphone, AlertCircle, Info, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TYPES = [
  { value: 'announcement', label: 'Announcement', icon: <Megaphone size={16} />, color: 'text-cyan-400' },
  { value: 'new_opportunity', label: 'New Opportunity', icon: <Bell size={16} />, color: 'text-green-400' },
  { value: 'deadline', label: 'Deadline Alert', icon: <AlertCircle size={16} />, color: 'text-red-400' },
  { value: 'system', label: 'System Message', icon: <Info size={16} />, color: 'text-gray-600 dark:text-gray-400' },
];

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error('Please fill in title and message'); return; }
    setSending(true);
    try {
      await notificationAPI.createAnnouncement({ title, message, type });
      toast.success('Announcement sent to all users! 📣');
      setTitle(''); setMessage(''); setType('announcement');
    } catch { toast.error('Failed to send announcement'); }
    setSending(false);
  };

  const selectedType = TYPES.find((t) => t.value === type);

  return (
    <AdminLayout title="Announcements">
      <div className="max-w-2xl">
        {/* Info banner */}
        <div className="glass-card border-cyan-500/20 p-5 mb-6 flex items-start gap-3">
          <Bell size={20} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Broadcast Notifications</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">Messages sent here will appear in the notifications panel for all registered students. Use this to announce new opportunities, deadlines, or important system updates.</p>
          </div>
        </div>

        {/* Compose form */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Megaphone size={18} className="text-cyan-400" /> Compose Announcement
          </h2>
          <form onSubmit={handleSend} className="space-y-5">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Type</label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-medium',
                      type === t.value ? 'bg-white dark:bg-gray-900/10 border-cyan-500/40 text-gray-900 dark:text-white' : 'bg-white dark:bg-gray-900/3 border-gray-200 dark:border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10')}>
                    <span className={t.color}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New University Applications Open!" className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                rows={5} className="input-field resize-none"
                placeholder="Write the full message that students will see in their notifications..." required />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{message.length} characters</p>
            </div>

            {/* Preview */}
            {(title || message) && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 p-4 bg-white dark:bg-gray-900/3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <div className="flex items-start gap-3">
                  <div className={clsx('text-sm mt-0.5', selectedType?.color)}>{selectedType?.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{title || 'Notification title'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{message || 'Message content...'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Just now · {selectedType?.label}</p>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
              {sending ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Sending...</>
              ) : (
                <><Send size={16} /> Send to All Students</>
              )}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
