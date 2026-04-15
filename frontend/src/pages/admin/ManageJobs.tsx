import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Briefcase, Search, MapPin, Star, Paperclip } from 'lucide-react';
import { jobAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import FileUploadPanel from '../../components/FileUploadPanel';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

interface DocEntry { name: string; url: string; uploadedAt: string }
interface Job {
  _id: string; title: string; company: string; type: string; location: string;
  deadline: string; requirements: string; link: string; fieldOfStudy: string;
  salary: string; description: string; featured: boolean;
  images: string[]; documents: DocEntry[];
}

const TYPES = ['job', 'internship', 'volunteering', 'government'];
const TYPE_COLORS: Record<string, string> = {
  job: 'bg-cyan-500/20 text-cyan-300',
  internship: 'bg-blue-500/20 text-blue-300',
  volunteering: 'bg-green-500/20 text-green-300',
  government: 'bg-purple-500/20 text-purple-300',
};
const EMPTY = {
  title: '', company: '', type: 'job', location: '', deadline: '',
  requirements: '', link: '', fieldOfStudy: '', salary: '', description: '', featured: false,
};

type Tab = 'details' | 'files';

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Job | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobAPI.getAll({ search, type: filterType || undefined, limit: 100 });
      setJobs(res.data.jobs);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filterType]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setActiveTab('details'); setModalOpen(true); };
  const openEdit = (j: Job) => {
    setForm({
      title: j.title, company: j.company, type: j.type, location: j.location,
      deadline: j.deadline ? format(new Date(j.deadline), 'yyyy-MM-dd') : '',
      requirements: j.requirements, link: j.link, fieldOfStudy: j.fieldOfStudy,
      salary: j.salary, description: j.description, featured: j.featured,
    });
    setEditItem(j); setActiveTab('details'); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await jobAPI.update(editItem._id, form); toast.success('Job updated!'); }
      else { await jobAPI.create(form); toast.success('Job posted!'); }
      setModalOpen(false); fetchJobs();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await jobAPI.delete(id); toast.success('Job deleted'); setDeleteId(null); fetchJobs(); }
    catch { toast.error('Failed to delete'); }
  };

  const refreshEditItem = async () => {
    if (!editItem) return;
    try {
      const res = await jobAPI.getById(editItem._id);
      const j: Job = res.data.job;
      setEditItem(j);
      fetchJobs();
    } catch { /* silent */ }
  };

  const fileCount = (j: Job) => (j.images?.length || 0) + (j.documents?.length || 0);

  return (
    <AdminLayout title="Manage Jobs">
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="select-field w-40">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Post Job
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">Job</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Files</th>
                  <th className="table-header">Deadline</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-500 dark:text-gray-400">No jobs found</td></tr>
                ) : jobs.map((j) => {
                  const expired = new Date(j.deadline) < new Date();
                  return (
                    <tr key={j._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{j.title}</span>
                          {j.featured && <Star size={12} className="text-yellow-400" />}
                        </div>
                      </td>
                      <td className="table-cell text-gray-600 dark:text-gray-400">{j.company}</td>
                      <td className="table-cell">
                        <span className={clsx('text-xs px-2 py-0.5 rounded capitalize', TYPE_COLORS[j.type] || 'bg-gray-500/20 text-gray-700 dark:text-gray-300')}>{j.type}</span>
                      </td>
                      <td className="table-cell text-xs text-gray-600 dark:text-gray-400"><span className="flex items-center gap-1"><MapPin size={10} className="text-cyan-600" />{j.location}</span></td>
                      <td className="table-cell">
                        {fileCount(j) > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                            <Paperclip size={11} /> {fileCount(j)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className={clsx('table-cell text-xs', expired ? 'text-red-400' : 'text-gray-600 dark:text-gray-400')}>
                        {j.deadline ? format(new Date(j.deadline), 'MMM dd, yyyy') : '—'}
                        {expired && ' ⚠'}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteId(j._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Job' : 'Post New Job'} size="lg">
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
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Software Engineer" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company *</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" placeholder="Company name" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
                  {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g. Kigali, Rwanda" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline *</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Salary/Stipend</label>
                <input type="text" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="input-field" placeholder="e.g. RWF 200,000/month" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Link *</label>
              <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" placeholder="https://..." required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements *</label>
              <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="input-field resize-none" placeholder="Skills, qualifications required..." required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" placeholder="Additional details..." /></div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="jfeatured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
              <label htmlFor="jfeatured" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /> Mark as featured</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Briefcase size={15} />}
                {editItem ? 'Save Changes' : 'Post Job'}
              </button>
            </div>
            {!editItem && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                You can upload images &amp; PDFs after creating the job listing.
              </p>
            )}
          </form>
        ) : (
          editItem && (
            <FileUploadPanel
              entityId={editItem._id}
              images={editItem.images || []}
              documents={editItem.documents || []}
              onUpload={jobAPI.uploadFiles}
              onDeleteFile={jobAPI.deleteFile}
              onRefresh={refreshEditItem}
            />
          )
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Job" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Are you sure you want to delete this job listing?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
