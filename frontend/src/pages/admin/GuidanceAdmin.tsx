import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, FileText, Search, Star, Clock } from 'lucide-react';
import { guidanceAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

interface Guidance { _id: string; title: string; category: string; content: string; resourceLink: string; readTime: number; featured: boolean; tags: string[]; }

const CATEGORIES = ['university_applications', 'cv_writing', 'career_development', 'interview_prep', 'scholarships', 'general'];
const EMPTY = { title: '', category: 'general', content: '', resourceLink: '', readTime: 5, featured: false, tags: '' };

export default function GuidanceAdmin() {
  const [guidance, setGuidance] = useState<Guidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Guidance | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guidanceAPI.getAll({ search, category: filterCat || undefined });
      setGuidance(res.data.guidance);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filterCat]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModalOpen(true); };
  const openEdit = (g: Guidance) => {
    setForm({ title: g.title, category: g.category, content: g.content, resourceLink: g.resourceLink || '', readTime: g.readTime, featured: g.featured, tags: g.tags?.join(', ') || '' });
    setEditItem(g); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (editItem) { await guidanceAPI.update(editItem._id, payload); toast.success('Article updated!'); }
      else { await guidanceAPI.create(payload); toast.success('Article created!'); }
      setModalOpen(false); fetch();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try { await guidanceAPI.delete(id); toast.success('Article deleted'); setDeleteId(null); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout title="Guidance Content">
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guidance..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="select-field w-44">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add Article
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guidance.length === 0 ? (
            <div className="col-span-3 text-center py-16 glass-card">
              <FileText size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No guidance articles yet</p>
            </div>
          ) : guidance.map((g) => (
            <div key={g._id} className="glass-card-hover p-5 flex flex-col">
              {g.featured && <span className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-black text-xs font-bold px-2 py-0.5 rounded-full mb-2 w-fit">⭐ Featured</span>}
              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-2 line-clamp-2">{g.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-3 flex-1 mb-3">{g.content.substring(0, 120)}...</p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="text-cyan-400 capitalize">{g.category.replace('_', ' ')}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {g.readTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(g)} className="btn-secondary flex-1 py-1.5 text-xs flex items-center justify-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleteId(g._id)} className="btn-danger py-1.5 px-3 text-xs flex items-center gap-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Article' : 'Add Guidance Article'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Read Time (minutes)</label>
              <input type="number" value={form.readTime} onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })} className="input-field" min="1" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">External Resource URL</label>
              <input type="url" value={form.resourceLink} onChange={(e) => setForm({ ...form, resourceLink: e.target.value })} className="input-field" placeholder="https://..." /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="cv, resume, application..." /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content *</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="input-field resize-none" placeholder="Write the full article content here..." required /></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="gfeatured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
            <label htmlFor="gfeatured" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /> Mark as featured</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <FileText size={15} />}
              {editItem ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Article" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Delete this guidance article permanently?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
