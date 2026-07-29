import { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  ClipboardList, Eye, Mail, Phone, Search, Trash2, 
  User as UserIcon, CheckCircle2, Clock, Send, ShieldCheck, 
  AlertCircle, LayoutGrid, CheckCircle, Hourglass, UserPlus,
  Briefcase, GraduationCap, ArrowRight, Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { applicationAPI, userAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Assistant = {
  _id: string;
  name: string;
  email: string;
};

type AssistanceRequest = {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  opportunityType: 'university' | 'job';
  opportunityName: string;
  status: string;
  notes?: string;
  assignedAssistantId?: Assistant;
  resolutionProof?: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = ['Interested', 'Applied', 'Submitted', 'Accepted', 'Rejected', 'In Progress', 'Resolved'];

/* ───────── Stat Card Component ───────── */
const StatCard = ({ label, value, icon, color, active, onClick }: { 
  label: string; value: number; icon: React.ReactNode; color: string; active?: boolean; onClick?: () => void;
}) => (
  <button 
    onClick={onClick}
    className={clsx(
      "glass-card p-4 flex items-center justify-between transition-all duration-300 text-left group",
      active ? "ring-2 ring-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10" : "hover:scale-[1.02] hover:bg-white/5",
    )}
  >
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 group-hover:text-cyan-500 transition-colors">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", color)}>
      {icon}
    </div>
  </button>
);

export default function AssistanceRequests() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [viewItem, setViewItem] = useState<AssistanceRequest | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionProof, setResolutionProof] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getAll({
        limit: 200, // Fetch more for better local filtering/stats
        search,
        status,
        opportunityType: type,
      });
      setRequests(res.data.applications);
    } catch {
      toast.error('Failed to load assistance requests');
    }
    setLoading(false);
  }, [search, status, type]);

  const fetchAssistants = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      const res = await userAPI.getAll({ role: 'assistant', limit: 100 });
      setAssistants(res.data.users);
    } catch { /* silent */ }
  }, [currentUser]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchAssistants(); }, [fetchAssistants]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = requests.length;
    const inProgress = requests.filter(r => r.status === 'In Progress').length;
    const resolved = requests.filter(r => r.status === 'Resolved').length;
    const unassigned = requests.filter(r => !r.assignedAssistantId).length;
    const uniType = requests.filter(r => r.opportunityType === 'university').length;
    const jobType = requests.filter(r => r.opportunityType === 'job').length;

    return { total, inProgress, resolved, unassigned, uniType, jobType };
  }, [requests]);

  const updateStatus = async (id: string, nextStatus: string) => {
    try {
      await applicationAPI.update(id, { status: nextStatus });
      setRequests((prev) => prev.map((item) => item._id === id ? { ...item, status: nextStatus } : item));
      setViewItem((prev) => prev && prev._id === id ? { ...prev, status: nextStatus } : prev);
      toast.success(`Status updated to ${nextStatus}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const assignAssistant = async (requestId: string, assistantId: string) => {
    try {
      await applicationAPI.update(requestId, { assignedAssistantId: assistantId, status: 'In Progress' });
      toast.success('Assistant assigned successfully');
      fetchRequests();
      if (viewItem?._id === requestId) setViewItem(null);
    } catch {
      toast.error('Failed to assign assistant');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewItem || !resolutionProof.trim()) return;
    setResolving(true);
    try {
      await applicationAPI.resolve(viewItem._id, resolutionProof.trim());
      toast.success('Request marked as Resolved');
      setRequests((prev) => prev.map((item) => item._id === viewItem._id ? { ...item, status: 'Resolved', resolutionProof } : item));
      setShowResolveModal(false);
      setResolutionProof('');
      setViewItem(null);
    } catch {
      toast.error('Failed to resolve request');
    }
    setResolving(false);
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

  const canResolve = (req: AssistanceRequest) => {
    if (currentUser?.role === 'admin') return true;
    return req.assignedAssistantId?._id === currentUser?._id;
  };

  return (
    <AdminLayout title={currentUser?.role === 'assistant' ? "My Assigned Tasks" : "Assistance Requests"}>
      
      {/* ══════ STATS SECTION ══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard 
          label="Total Requests" 
          value={stats.total} 
          icon={<ClipboardList size={20} />} 
          color="bg-cyan-500/10 text-cyan-500" 
          active={status === '' && type === ''}
          onClick={() => { setStatus(''); setType(''); }}
        />
        <StatCard 
          label="In Progress" 
          value={stats.inProgress} 
          icon={<Hourglass size={20} />} 
          color="bg-yellow-500/10 text-yellow-500" 
          active={status === 'In Progress'}
          onClick={() => setStatus('In Progress')}
        />
        <StatCard 
          label="Resolved" 
          value={stats.resolved} 
          icon={<CheckCircle size={20} />} 
          color="bg-emerald-500/10 text-emerald-500" 
          active={status === 'Resolved'}
          onClick={() => setStatus('Resolved')}
        />
        <StatCard 
          label="Unassigned" 
          value={stats.unassigned} 
          icon={<UserPlus size={20} />} 
          color="bg-red-500/10 text-red-500" 
          active={status === 'Interested'} // Usually new ones are unassigned
          onClick={() => setStatus('Interested')}
        />
        <StatCard 
          label="Universities" 
          value={stats.uniType} 
          icon={<GraduationCap size={20} />} 
          color="bg-purple-500/10 text-purple-500" 
          active={type === 'university'}
          onClick={() => setType('university')}
        />
        <StatCard 
          label="Jobs" 
          value={stats.jobType} 
          icon={<Briefcase size={20} />} 
          color="bg-blue-500/10 text-blue-500" 
          active={type === 'job'}
          onClick={() => setType('job')}
        />
      </div>

      {/* ══════ FILTERS & SEARCH ══════ */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, email, or opportunity..."
            className="input-field pl-11 py-3"
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="select-field pl-9 h-full">
              <option value="">All Types</option>
              <option value="university">Universities</option>
              <option value="job">Jobs</option>
            </select>
          </div>
          <div className="relative flex-1 sm:w-48">
            <LayoutGrid size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field pl-9 h-full">
              <option value="">All Statuses</option>
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {(search || status || type) && (
            <button 
              onClick={() => { setSearch(''); setStatus(''); setType(''); }}
              className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ══════ REQUESTS TABLE ══════ */}
      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900/20">
                <tr>
                  <th className="table-header">Applicant Information</th>
                  <th className="table-header">Target Opportunity</th>
                  <th className="table-header">Assigned To</th>
                  <th className="table-header">Current Status</th>
                  <th className="table-header">Date Logged</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                            <Search size={32} />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-bold">No requests found matching your criteria</p>
                          <button onClick={() => { setSearch(''); setStatus(''); setType(''); }} className="text-cyan-500 text-sm font-bold hover:underline">View all requests</button>
                        </div>
                      </td>
                    </tr>
                  ) : requests.map((item, index) => (
                    <motion.tr 
                      key={item._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 dark:border-white/5 transition-colors last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 group/row"
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                            {item.studentName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900 dark:text-white truncate">{item.studentName}</div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                              <Mail size={10} className="shrink-0" />
                              <span className="truncate">{item.studentEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            item.opportunityType === 'university' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                          )}>
                            {item.opportunityType === 'university' ? <GraduationCap size={14} /> : <Briefcase size={14} />}
                          </div>
                          <div className="max-w-[180px] truncate font-bold text-gray-800 dark:text-gray-200">{item.opportunityName}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {item.assignedAssistantId ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 text-[11px] font-black">
                              {item.assignedAssistantId.name[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.assignedAssistantId.name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                            <AlertCircle size={10} /> Unassigned
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setViewItem(item)} 
                            title="View Details"
                            className="rounded-xl p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-cyan-500 hover:border-cyan-500 transition-all shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                          {currentUser?.role === 'admin' && (
                            <button 
                              onClick={() => deleteRequest(item._id)} 
                              title="Delete Record"
                              className="rounded-xl p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ DETAIL MODAL ══════ */}
      <Modal isOpen={!!viewItem && !showResolveModal} onClose={() => setViewItem(null)} title="Assistance Case Details" size="lg">
        {viewItem && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-black text-white shadow-xl shadow-cyan-500/20">
                  {viewItem.studentName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{viewItem.studentName}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={viewItem.status} />
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 border border-gray-200 dark:border-white/10 px-2 py-1 rounded-md">ID: {viewItem._id.slice(-6)}</span>
                  </div>
                </div>
              </div>
              {viewItem.status !== 'Resolved' && canResolve(viewItem) && (
                <button 
                  onClick={() => setShowResolveModal(true)}
                  className="btn-primary py-3 px-6 flex items-center gap-2 text-sm font-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
                >
                  <ShieldCheck size={18} /> Resolve Case
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-5 rounded-[24px] bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-5 flex items-center gap-2">
                    <ClipboardList size={12} /> Contact & Target
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Email Address</span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white truncate pr-2">{viewItem.studentEmail}</span>
                        <a href={`mailto:${viewItem.studentEmail}`} className="text-cyan-500 hover:underline shrink-0">Send Email</a>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</span>
                      <span className="font-bold text-gray-900 dark:text-white">{viewItem.studentPhone || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 dark:border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Selected Opportunity</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={clsx(
                          "w-6 h-6 rounded-md flex items-center justify-center",
                          viewItem.opportunityType === 'university' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          {viewItem.opportunityType === 'university' ? <GraduationCap size={12} /> : <Briefcase size={12} />}
                        </div>
                        <span className="font-black text-gray-900 dark:text-white uppercase text-xs">{viewItem.opportunityName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-5 flex items-center gap-2">
                    <UserIcon size={12} /> Case Assignment
                  </h4>
                  {currentUser?.role === 'admin' ? (
                    <div className="space-y-4">
                      <select 
                        value={viewItem.assignedAssistantId?._id || ''} 
                        onChange={(e) => assignAssistant(viewItem._id, e.target.value)}
                        className="select-field w-full text-xs font-black uppercase tracking-wider h-11"
                      >
                        <option value="">Select Assistant to Assign</option>
                        {assistants.map(as => <option key={as._id} value={as._id}>{as.name}</option>)}
                      </select>
                      <p className="text-[10px] text-amber-500/80 italic font-medium">Re-assigning will move this task to the new assistant's board.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-2 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black text-sm">
                        {viewItem.assignedAssistantId?.name[0].toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Handled By</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{viewItem.assignedAssistantId?.name || 'Unassigned'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-[24px] bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-white/5 shadow-sm h-full">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-5 flex items-center gap-2">
                    <Quote size={12} /> Student Notes
                  </h4>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl min-h-[120px]">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      "{viewItem.notes || 'No specific notes provided by the student'}"
                    </p>
                  </div>

                  {viewItem.status === 'Resolved' && viewItem.resolutionProof && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={12} /> Resolution Evidence
                      </h4>
                      <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold leading-relaxed">
                          {viewItem.resolutionProof}
                        </p>
                        <p className="text-[10px] text-emerald-500/60 mt-2 italic">Marked resolved on {new Date(viewItem.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {currentUser?.role === 'admin' && viewItem.status !== 'Resolved' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">Admin Status:</span>
                    <select 
                      value={viewItem.status} 
                      onChange={(e) => updateStatus(viewItem._id, e.target.value)} 
                      className="select-field text-xs h-10 w-full sm:w-44 font-bold"
                    >
                      {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setViewItem(null)} 
                className="w-full sm:w-auto px-10 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ══════ RESOLVE MODAL ══════ */}
      <Modal 
        isOpen={showResolveModal} 
        onClose={() => setShowResolveModal(false)} 
        title="Confirm Case Resolution" 
        size="md"
      >
        <form onSubmit={handleResolve} className="space-y-6">
          <div className="p-6 rounded-3xl bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 text-center">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Resolve This Task</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Confirming resolution means the student's request has been fully addressed. Please provide the final results or proof below.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Resolution Evidence / Details *</label>
            <textarea 
              value={resolutionProof}
              onChange={(e) => setResolutionProof(e.target.value)}
              className="input-field min-h-[160px] resize-none text-sm p-4 rounded-2xl"
              placeholder="Example: Application for University of Rwanda submitted. Application ID: UR-998877. Confirmation PDF sent to student's email."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setShowResolveModal(false)} className="btn-secondary py-3.5 rounded-2xl font-bold">Cancel</button>
            <button 
              type="submit" 
              disabled={resolving || !resolutionProof.trim()} 
              className="btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 font-black shadow-lg shadow-cyan-500/20"
            >
              {resolving ? (
                <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send size={18} /> Finish Case</>
              )}
            </button>
          </div>
        </form>
      </Modal>

    </AdminLayout>
  );
}
