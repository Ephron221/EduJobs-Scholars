import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Search, Calendar } from 'lucide-react';
import { programAPI, universityAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

interface Program { _id: string; name: string; fieldOfStudy: string; duration: string; level: string; fundingType: string; deadline: string; requirements: string; applicationLink: string; tuitionFee: string; universityId: {_id: string; name: string} | string; }
interface University { _id: string; name: string; }

const FIELDS = ['Engineering', 'Medicine', 'Business', 'Law', 'Arts', 'Science', 'Agriculture', 'Education', 'Technology', 'Social Sciences'];
const LEVELS = ['undergraduate', 'postgraduate', 'diploma', 'certificate'];
const FUNDING_TYPES = [
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'partial_scholarship', label: 'Partial Scholarship' },
  { value: 'study_loan', label: 'Study Loan' },
  { value: 'self_sponsored', label: 'Self-sponsored' },
];
const EMPTY = { universityId: '', name: '', fieldOfStudy: '', level: 'undergraduate', fundingType: 'self_sponsored', requirements: '', deadline: '', applicationLink: '', duration: '', tuitionFee: '' };

export default function ManagePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterUni, setFilterUni] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Program | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        programAPI.getAll({ search, limit: 100, ...(filterUni ? {} : {}) }),
        universityAPI.getAll({ limit: 100 }),
      ]);
      let progs = pRes.data.programs as Program[];
      if (filterUni) progs = progs.filter((p) => {
        const uniId = typeof p.universityId === 'object' ? p.universityId._id : p.universityId;
        return uniId === filterUni;
      });
      setPrograms(progs);
      setUniversities(uRes.data.universities);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filterUni]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModalOpen(true); };
  const openEdit = (p: Program) => {
    const uniId = typeof p.universityId === 'object' ? p.universityId._id : p.universityId;
    setForm({ universityId: uniId, name: p.name, fieldOfStudy: p.fieldOfStudy, level: p.level, fundingType: p.fundingType || 'self_sponsored', requirements: p.requirements, deadline: p.deadline ? format(new Date(p.deadline), 'yyyy-MM-dd') : '', applicationLink: p.applicationLink, duration: p.duration, tuitionFee: p.tuitionFee });
    setEditItem(p); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) { await programAPI.update(editItem._id, form); toast.success('Program updated!'); }
      else { await programAPI.create(form); toast.success('Program created!'); }
      setModalOpen(false); fetchAll();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await programAPI.delete(id); toast.success('Program deleted'); setDeleteId(null); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const isExpired = (deadline: string) => new Date(deadline) < new Date();

  return (
    <AdminLayout title="Manage Programs">
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programs..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={filterUni} onChange={(e) => setFilterUni(e.target.value)} className="select-field w-44">
            <option value="">All Universities</option>
            {universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add Program
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">Program</th>
                  <th className="table-header">University</th>
                  <th className="table-header">Field</th>
                  <th className="table-header">Level</th>
                  <th className="table-header">Funding</th>
                  <th className="table-header">Deadline</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-gray-500 dark:text-gray-400">No programs found</td></tr>
                ) : programs.map((p) => {
                  const expired = isExpired(p.deadline);
                  const fundingLabel = FUNDING_TYPES.find((t) => t.value === p.fundingType)?.label || 'Self-sponsored';
                  const uniName = typeof p.universityId === 'object' ? p.universityId.name : '—';
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                      <td className="table-cell font-medium text-gray-900 dark:text-white">{p.name}</td>
                      <td className="table-cell text-gray-600 dark:text-gray-400 text-xs">{uniName}</td>
                      <td className="table-cell"><span className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded">{p.fieldOfStudy}</span></td>
                      <td className="table-cell text-gray-600 dark:text-gray-400 capitalize text-xs">{p.level}</td>
                      <td className="table-cell"><span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">{fundingLabel}</span></td>
                      <td className={clsx('table-cell text-xs', expired ? 'text-red-400' : 'text-gray-600 dark:text-gray-400')}>
                        <span className="flex items-center gap-1"><Calendar size={11} />
                          {p.deadline ? format(new Date(p.deadline), 'MMM dd, yyyy') : '—'}
                          {expired && ' (Expired)'}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={15} /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Program' : 'Add Program'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">University *</label>
            <select value={form.universityId} onChange={(e) => setForm({ ...form, universityId: e.target.value })} className="select-field" required>
              <option value="">Select university...</option>
              {universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. BSc Computer Science" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Field of Study *</label>
              <select value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} className="select-field" required>
                <option value="">Select field...</option>
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level *</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="select-field">
                {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration *</label>
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" placeholder="e.g. 4 years" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Funding Type *</label>
              <select value={form.fundingType} onChange={(e) => setForm({ ...form, fundingType: e.target.value })} className="select-field">
                {FUNDING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Deadline *</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tuition Fee</label>
              <input type="text" value={form.tuitionFee} onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })} className="input-field" placeholder="e.g. Free / $5,000/year" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Link *</label>
            <input type="url" value={form.applicationLink} onChange={(e) => setForm({ ...form, applicationLink: e.target.value })} className="input-field" placeholder="https://..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Entry Requirements *</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="input-field resize-none" placeholder="Subject combinations, minimum grades..." required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <BookOpen size={15} />}
              {editItem ? 'Save Changes' : 'Add Program'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Program" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Are you sure you want to delete this program?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
