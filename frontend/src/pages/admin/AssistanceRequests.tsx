import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Eye, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { applicationAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

type AssistanceRequest = {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  opportunityType: 'university' | 'job';
  opportunityName: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['Interested', 'Applied', 'Submitted', 'Accepted', 'Rejected'];

export default function AssistanceRequests() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [viewItem, setViewItem] = useState<AssistanceRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getAll({
        limit: 100,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(type ? { opportunityType: type } : {}),
      });
      setRequests(res.data.applications);
    } catch {
      toast.error('Failed to load assistance requests');
    }
    setLoading(false);
  }, [search, status, type]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await applicationAPI.update(id, { status: nextStatus });
      setRequests((prev) => prev.map((item) => item._id === id ? { ...item, status: nextStatus } : item));
      setViewItem((prev) => prev && prev._id === id ? { ...prev, status: nextStatus } : prev);
      toast.success('Request status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!window.confirm('Delete this assistance request?')) return;
    try {
      await applicationAPI.delete(id);
      setRequests((prev) => prev.filter((item) => item._id !== id));
      setViewItem(null);
      toast.success('Request deleted');
    } catch {
      toast.error('Failed to delete request');
    }
  };

  return (
    <AdminLayout title="Assistance Requests">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, opportunity..."
            className="input-field pl-9"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="select-field sm:w-44">
          <option value="">All Types</option>
          <option value="university">Universities</option>
          <option value="job">Jobs</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field sm:w-44">
          <option value="">All Statuses</option>
          {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900/20">
                <tr>
                  <th className="table-header">Applicant</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Opportunity</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Submitted</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-500 dark:text-gray-400">
                      No assistance requests yet.
                    </td>
                  </tr>
                ) : requests.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50 dark:border-white/5 dark:hover:bg-gray-800/60">
                    <td className="table-cell">
                      <div className="font-semibold text-gray-900 dark:text-white">{item.studentName}</div>
                      <div className="text-xs capitalize text-cyan-600 dark:text-cyan-400">{item.opportunityType}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 text-xs"><Mail size={12} /> {item.studentEmail}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs"><Phone size={12} /> {item.studentPhone || 'Not provided'}</div>
                    </td>
                    <td className="table-cell max-w-xs truncate">{item.opportunityName}</td>
                    <td className="table-cell"><StatusBadge status={item.status} /></td>
                    <td className="table-cell text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewItem(item)} className="rounded-lg p-1.5 text-gray-600 transition-all hover:bg-cyan-500/10 hover:text-cyan-400 dark:text-gray-400">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => deleteRequest(item._id)} className="rounded-lg p-1.5 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400 dark:text-gray-400">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Assistance Request" size="lg">
        {viewItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-2xl font-black text-black">
                {viewItem.studentName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">{viewItem.studentName}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-sm text-gray-600 dark:bg-white/10 dark:text-gray-300">{viewItem.opportunityType}</span>
                  <StatusBadge status={viewItem.status} />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900 dark:border-white/10 dark:text-white">
                  <ClipboardList size={14} className="text-cyan-500" /> Request Detail
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Opportunity</span><span className="text-right font-semibold text-gray-900 dark:text-white">{viewItem.opportunityName}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Type</span><span className="font-semibold capitalize text-gray-900 dark:text-white">{viewItem.opportunityType}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Submitted</span><span className="font-semibold text-gray-900 dark:text-white">{new Date(viewItem.createdAt).toLocaleString()}</span></div>
                </div>
              </div>
              <div>
                <h4 className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900 dark:border-white/10 dark:text-white">
                  <Phone size={14} className="text-cyan-500" /> Contact Info
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Email</span><span className="text-right font-semibold text-gray-900 dark:text-white">{viewItem.studentEmail}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-gray-500">Phone</span><span className="font-semibold text-gray-900 dark:text-white">{viewItem.studentPhone || 'Not provided'}</span></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <select value={viewItem.status} onChange={(e) => updateStatus(viewItem._id, e.target.value)} className="select-field sm:w-48">
                {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button onClick={() => setViewItem(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
