import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Pencil, Trash2, GraduationCap, Search, Globe, Star, Paperclip, Clock, CheckCircle2, XCircle, LayoutGrid, Filter, AlertCircle } from 'lucide-react';
import { universityAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import FileUploadPanel from '../../components/FileUploadPanel';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface DocEntry { name: string; url: string; uploadedAt: string }
interface University {
  _id: string; name: string; country: string; website: string;
  description: string; logoUrl: string; phone: string; deadline: string;
  intake: string; academicYear: string; category: string;
  featured: boolean;
  images: string[]; documents: DocEntry[];
}

const CATEGORIES = ['Scholarship', 'Partial Scholarship', 'Study Loan', 'Self-sponsored'];

const EMPTY: Omit<University, '_id'> = {
  name: '', country: '', website: '', description: '', logoUrl: '',
  phone: '', deadline: '', intake: '', academicYear: '', category: 'Scholarship',
  featured: false, images: [], documents: [],
};

type Tab = 'details' | 'files';

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

export default function ManageUniversities() {
  const { isAdmin } = useAuth();
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<University | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [customCategory, setCustomCategory] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await universityAPI.getAll({ search, limit: 100 });
      setUnis(res.data.universities);
    } catch { /* silent */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const stats = useMemo(() => {
    const total = unis.length;
    const now = new Date().getTime();
    const open = unis.filter(u => !u.deadline || new Date(u.deadline).getTime() > now).length;
    const closed = total - open;
    const featured = unis.filter(u => u.featured).length;
    const categoriesCount = new Set(unis.map(u => u.category)).size;

    return { total, open, closed, featured, categoriesCount };
  }, [unis]);

  const filteredUnis = useMemo(() => {
    return unis.filter(u => {
      const now = new Date().getTime();
      const isOpen = !u.deadline || new Date(u.deadline).getTime() > now;
      
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'open' && isOpen) || (filterStatus === 'closed' && !isOpen);
      const matchesCategory = !filterCategory || u.category === filterCategory;
      
      return matchesStatus && matchesCategory;
    });
  }, [unis, filterStatus, filterCategory]);

  const openCreate = () => {
    setForm(EMPTY); setEditItem(null); setActiveTab('details'); setModalOpen(true); setCustomCategory('');
  };
  const openEdit = (u: University) => {
    setForm({
      name: u.name, country: u.country, website: u.website, description: u.description,
      logoUrl: u.logoUrl, phone: u.phone || '', deadline: u.deadline || '',
      intake: u.intake || '', academicYear: u.academicYear || '',
      category: u.category || 'Scholarship',
      featured: u.featured,
      images: u.images || [], documents: u.documents || [],
    });
    setEditItem(u); setActiveTab('details'); setModalOpen(true);
    if (!CATEGORIES.includes(u.category)) {
      setCustomCategory(u.category);
    } else {
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalForm = { ...form, category: customCategory || form.category };
    try {
      if (editItem) {
        await universityAPI.update(editItem._id, finalForm);
        toast.success('University updated!');
      } else {
        await universityAPI.create(finalForm);
        toast.success('University created!');
      }
      setModalOpen(false);
      fetch();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await universityAPI.delete(id);
      toast.success('University deleted');
      setDeleteId(null);
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  const refreshEditItem = async () => {
    if (!editItem) return;
    try {
      const res = await universityAPI.getById(editItem._id);
      const u: University = res.data.university;
      setEditItem(u);
      setForm((f) => ({ ...f, images: u.images || [], documents: u.documents || [] }));
      fetch();
    } catch { /* silent */ }
  };

  const fileCount = (u: University) => (u.images?.length || 0) + (u.documents?.length || 0);

  return (
    <AdminLayout title="Manage Universities">
      
      {/* ══════ STATS SECTION ══════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard 
          label="Total Universities" 
          value={stats.total} 
          icon={<GraduationCap size={20} />} 
          color="bg-cyan-500/10 text-cyan-500" 
          active={filterStatus === 'all' && filterCategory === ''}
          onClick={() => { setFilterStatus('all'); setFilterCategory(''); }}
        />
        <StatCard 
          label="Open Applications" 
          value={stats.open} 
          icon={<CheckCircle2 size={20} />} 
          color="bg-emerald-500/10 text-emerald-500" 
          active={filterStatus === 'open'}
          onClick={() => setFilterStatus('open')}
        />
        <StatCard 
          label="Closed / Expired" 
          value={stats.closed} 
          icon={<XCircle size={20} />} 
          color="bg-red-500/10 text-red-500" 
          active={filterStatus === 'closed'}
          onClick={() => setFilterStatus('closed')}
        />
        <StatCard 
          label="Featured" 
          value={stats.featured} 
          icon={<Star size={20} />} 
          color="bg-yellow-500/10 text-yellow-500" 
        />
        <StatCard 
          label="Unique Categories" 
          value={stats.categoriesCount} 
          icon={<LayoutGrid size={20} />} 
          color="bg-purple-500/10 text-purple-500" 
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities by name or location..." className="input-field pl-11 py-3" />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="select-field pl-9 h-full font-bold text-xs uppercase tracking-wider">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-3">
            <Plus size={18} /> Add University
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">University</th>
                  <th className="table-header">Category</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header">Country</th>
                  <th className="table-header">Files</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredUnis.length === 0 ? (
                    <tr><td colSpan={6} className="py-24 text-center text-gray-500 dark:text-gray-400 font-bold">No universities found</td></tr>
                  ) : filteredUnis.map((u, idx) => {
                    const now = new Date().getTime();
                    const isOpen = !u.deadline || new Date(u.deadline).getTime() > now;
                    return (
                      <motion.tr 
                        key={u._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 group/row"
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900 to-gray-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-black text-sm shrink-0 shadow-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white truncate">{u.name}</span>
                                {u.featured && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5 truncate">{u.intake} {u.academicYear && `[${u.academicYear}]`}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase border border-cyan-500/20 tracking-tighter">
                            {u.category}
                          </span>
                        </td>
                        <td className="table-cell text-center">
                          <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            isOpen ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                          )}>
                            {isOpen ? <Clock size={10} /> : <AlertCircle size={10} />}
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        </td>
                        <td className="table-cell text-gray-600 dark:text-gray-400 font-medium">{u.country}</td>
                        <td className="table-cell">
                          {fileCount(u) > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/5 px-2 py-1 rounded-lg">
                              <Paperclip size={12} /> {fileCount(u)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No files</span>
                          )}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(u)} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-sm">
                              <Pencil size={15} />
                            </button>
                            {isAdmin && (
                              <button onClick={() => setDeleteId(u._id)} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-400 hover:border-red-500 transition-all shadow-sm">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit University' : 'Add University'} size="lg">
        {/* Tab Bar */}
        <div className="flex gap-1 mb-5 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-xl">
          {(['details', 'files'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'files' && !editItem}
              className={clsx(
                'flex-1 py-1.5 px-3 rounded-lg text-sm font-medium capitalize transition-all',
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                tab === 'files' && !editItem && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tab === 'files' ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Paperclip size={13} /> Files
                  {editItem && fileCount(editItem) > 0 && (
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 rounded-full px-1.5 py-0.5 leading-none">
                      {fileCount(editItem)}
                    </span>
                  )}
                </span>
              ) : 'Details'}
            </button>
          ))}
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">University Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. University of Rwanda" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Country *</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field" placeholder="e.g. Rwanda" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Category *</label>
                <select 
                  value={CATEGORIES.includes(form.category) ? form.category : 'Custom'} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Custom') {
                      setForm({ ...form, category: customCategory || '' });
                    } else {
                      setForm({ ...form, category: val });
                      setCustomCategory('');
                    }
                  }} 
                  className="input-field"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Custom">Custom...</option>
                </select>
              </div>
              {(form.category === 'Custom' || !CATEGORIES.includes(form.category)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Custom Category Name</label>
                  <input 
                    type="text" 
                    value={customCategory} 
                    onChange={(e) => setCustomCategory(e.target.value)} 
                    className="input-field" 
                    placeholder="e.g. Full Scholarship"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="e.g. +250..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Deadline *</label>
                <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Intake</label>
                <input type="text" value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} className="input-field" placeholder="e.g. September" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Academic Year</label>
                <input type="text" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} className="input-field" placeholder="e.g. 2026-2027" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Official Website *</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Logo URL</label>
              <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 font-bold uppercase text-[10px] tracking-widest">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Brief description..." required />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
              <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /> Mark as featured</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-2xl">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black">
                {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Plus size={18} />}
                {editItem ? 'Save Changes' : 'Add University'}
              </button>
            </div>
          </form>
        ) : (
          editItem && (
            <FileUploadPanel
              entityId={editItem._id}
              images={editItem.images || []}
              documents={editItem.documents || []}
              onUpload={universityAPI.uploadFiles}
              onDeleteFile={universityAPI.deleteFile}
              onRefresh={refreshEditItem}
            />
          )
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete University" size="sm">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Are you absolutely sure?</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            You are about to delete this university record. This will also affect linked programs. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 py-3 rounded-2xl font-bold uppercase text-xs">Cancel</button>
            <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 py-3 rounded-2xl font-black uppercase text-xs">Delete Record</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
