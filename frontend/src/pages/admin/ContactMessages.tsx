import { useState, useEffect, useCallback } from 'react';
import { Mail, MessageSquare, Phone, Search, CheckCircle, Clock, Trash2, Smartphone } from 'lucide-react';
import { contactAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [viewModal, setViewModal] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactAPI.getAll({ search, status: filterStatus || undefined, page, limit: 15 });
      setMessages(res.data.messages);
      setTotal(res.data.total);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error('Failed to load messages');
    }
    setLoading(false);
  }, [search, filterStatus, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
      await contactAPI.updateStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      if (viewModal && viewModal._id === id) {
        setViewModal({ ...viewModal, status: newStatus as 'unread' | 'read' });
      }
      fetchMessages();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contactAPI.delete(id);
      toast.success('Message deleted');
      setDeleteId(null);
      fetchMessages();
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const openMessage = (msg: ContactMessage) => {
    setViewModal(msg);
    if (msg.status === 'unread') {
      toggleStatus(msg._id, 'unread'); // Auto mark as read when opened
    }
  };

  // Helper to format phone for WhatsApp
  const getWaLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <AdminLayout title="Inquiries & Messages">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Total Inquiries</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p></div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center"><MessageSquare className="text-cyan-500" size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Unread</p><p className="text-2xl font-bold text-yellow-500">{unreadCount}</p></div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><Clock className="text-yellow-500" size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Read / Resolved</p><p className="text-2xl font-bold text-green-500">{total - unreadCount}</p></div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="text-green-500" size={20} /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, subject..." className="input-field pl-9 py-2.5" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="select-field w-36 py-2.5">
          <option value="">All Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">Sender / Subject</th>
                  <th className="table-header">Contact Info</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan={4} className="py-16 text-center text-gray-500 dark:text-gray-400">No messages found</td></tr>
                ) : messages.map((m) => (
                  <tr key={m._id} onClick={() => openMessage(m)} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-l-4 ${m.status === 'unread' ? 'border-l-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10' : 'border-l-transparent'}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${m.status === 'unread' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm ${m.status === 'unread' ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{m.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] md:max-w-xs truncate">{m.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-gray-600 dark:text-gray-400 block">{m.email}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">{m.phone}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(m.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${m.status === 'unread' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {Math.ceil(total / 15) > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-white/5">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">← Prev</button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {Math.ceil(total / 15)}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(total / 15)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* Read Message Modal */}
      {viewModal && (
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Inquiry Details" size="md">
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{viewModal.subject}</h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">From</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{viewModal.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-900 dark:text-white">{format(new Date(viewModal.createdAt), 'MMM dd, yyyy - hh:mm a')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <a href={`mailto:${viewModal.email}`} className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-cyan-100 dark:border-cyan-900/50">
                 <Mail size={18} />
                 <span className="text-xs font-semibold">Email Reply</span>
               </a>
               <a href={getWaLink(viewModal.phone)} target="_blank" rel="noopener noreferrer" className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-100 dark:border-green-900/50">
                 <Smartphone size={18} />
                 <span className="text-xs font-semibold">WhatsApp</span>
               </a>
               <a href={`sms:${viewModal.phone}`} className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-900/50">
                 <Phone size={18} />
                 <span className="text-xs font-semibold">Send SMS</span>
               </a>
            </div>

            {/* Message Body */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</p>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 min-h-[120px]">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {viewModal.message}
                </p>
              </div>
            </div>

            {/* Actions Bottom */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 items-center justify-between">
              <button onClick={() => setDeleteId(viewModal._id)} className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors tooltip-trigger relative group">
                <Trash2 size={18} />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Delete</span>
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(viewModal._id, viewModal.status)} className="btn-secondary py-2 text-xs">
                  Mark as {viewModal.status === 'unread' ? 'Read' : 'Unread'}
                </button>
                <button onClick={() => setViewModal(null)} className="btn-primary py-2 px-6">Close</button>
              </div>
            </div>
            
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Message" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Are you sure you want to delete this message permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>

    </AdminLayout>
  );
}
