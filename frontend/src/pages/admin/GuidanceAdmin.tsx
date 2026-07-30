import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, FileText, Search, Star, Clock,
  BookOpen, GraduationCap, Briefcase, Lightbulb, Award,
  Tag, Filter, ChevronLeft, ChevronRight, LayoutGrid,
  Activity, ExternalLink, Globe
} from 'lucide-react';
import { guidanceAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Guidance {
  _id: string;
  title: string;
  category: string;
  content: string;
  resourceLink: string;
  readTime: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
}

const CATEGORIES = [
  { value: 'university_applications', label: 'University Apps', icon: <GraduationCap size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { value: 'cv_writing', label: 'CV Writing', icon: <FileText size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'career_development', label: 'Career Growth', icon: <Briefcase size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { value: 'interview_prep', label: 'Interviews', icon: <Lightbulb size={16} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { value: 'scholarships', label: 'Scholarships', icon: <Award size={16} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { value: 'general', label: 'General', icon: <Tag size={16} />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

const EMPTY = { title: '', category: 'general', content: '', resourceLink: '', readTime: 5, featured: false, tags: '' };

export default function GuidanceAdmin() {
  const [guidance, setGuidance] = useState<Guidance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({ total: 0 });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Guidance | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await guidanceAPI.getStats();
      setStats(res.data);
    } catch { /* silent */ }
  }, []);

  const fetchGuidance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await guidanceAPI.getAll({
        search,
        category: filterCat || undefined,
        page,
        limit: 9
      });
      setGuidance(res.data.guidance);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load guidance content');
    }
    setLoading(false);
  }, [search, filterCat, page]);

  useEffect(() => {
    fetchStats();
    fetchGuidance();
  }, [fetchStats, fetchGuidance]);

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setModalOpen(true); };

  const openEdit = (g: Guidance) => {
    setForm({
      title: g.title,
      category: g.category,
      content: g.content,
      resourceLink: g.resourceLink || '',
      readTime: g.readTime,
      featured: g.featured,
      tags: g.tags?.join(', ') || ''
    });
    setEditItem(g);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
      if (editItem) {
        await guidanceAPI.update(editItem._id, payload);
        toast.success('Article updated successfully!');
      } else {
        await guidanceAPI.create(payload);
        toast.success('New article published!');
      }
      setModalOpen(false);
      fetchGuidance();
      fetchStats();
    } catch {
      toast.error('Failed to save article');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await guidanceAPI.delete(id);
      toast.success('Article deleted');
      setDeleteId(null);
      fetchGuidance();
      fetchStats();
    } catch {
      toast.error('Failed to delete article');
    }
  };

  return (
    <AdminLayout title="Guidance Content">
      <div className="space-y-8">

        {/* Dynamic Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => { setFilterCat(''); setPage(1); }}
            className={clsx(
              "glass-card p-4 flex flex-col justify-between cursor-pointer border-transparent transition-all",
              filterCat === '' ? "ring-2 ring-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10" : "hover:bg-white dark:hover:bg-white/5"
            )}
          >
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</p>
            <div className="flex items-center justify-between mt-2">
               <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stats.total}</span>
               <LayoutGrid size={16} className="text-cyan-500" />
            </div>
          </motion.div>

          {CATEGORIES.map(cat => (
            <motion.div
              key={cat.value}
              whileHover={{ scale: 1.02 }}
              onClick={() => { setFilterCat(cat.value); setPage(1); }}
              className={clsx(
                "glass-card p-4 flex flex-col justify-between cursor-pointer border-transparent transition-all",
                filterCat === cat.value ? `ring-2 ring-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/10` : "hover:bg-white dark:hover:bg-white/5"
              )}
            >
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest truncate">{cat.label}</p>
              <div className="flex items-center justify-between mt-2">
                 <span className={clsx("text-2xl font-black leading-none", cat.color)}>{stats[cat.value] || 0}</span>
                 <div className={clsx("w-6 h-6 rounded-lg flex items-center justify-center", cat.bg, cat.color)}>
                    {cat.icon}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900/40 p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex flex-1 w-full gap-3">
            <div className="relative flex-1 max-w-md group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search guidance articles..."
                className="input-field pl-12 py-3 text-sm font-bold bg-white dark:bg-gray-800"
              />
            </div>
            <div className="hidden lg:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/5">
              <Filter size={14} className="text-gray-400" />
              <select
                value={filterCat}
                onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
                className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 text-gray-600 dark:text-gray-400 outline-none"
              >
                <option value="">Filter Category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> New Article
          </button>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <Loader />
             <p className="text-xs font-black uppercase text-gray-400 animate-pulse tracking-widest">Loading Resources...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {guidance.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="col-span-full text-center py-24 glass-card border-dashed"
                  >
                    <BookOpen size={64} className="text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No articles found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters.</p>
                  </motion.div>
                ) : guidance.map((g, idx) => {
                  const catInfo = CATEGORIES.find(c => c.value === g.category) || CATEGORIES[5];
                  return (
                    <motion.div
                      key={g._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={clsx(
                        "glass-card-hover p-6 flex flex-col group relative overflow-hidden",
                        g.featured && "border-cyan-500/30"
                      )}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(g)}
                              className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-cyan-500 shadow-xl border border-gray-100 dark:border-white/10 transition-all"
                            >
                               <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(g._id)}
                              className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 shadow-xl border border-gray-100 dark:border-white/10 transition-all"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className={clsx("p-2 rounded-xl text-sm shrink-0 shadow-inner", catInfo.bg, catInfo.color)}>
                          {catInfo.icon}
                        </div>
                        <div className="min-w-0">
                           <span className={clsx("text-[10px] font-black uppercase tracking-widest", catInfo.color)}>{catInfo.label}</span>
                           <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                              <span className="flex items-center gap-1"><Clock size={10} /> {g.readTime}m read</span>
                              <span>•</span>
                              <span>{format(new Date(g.createdAt), 'MMM dd')}</span>
                           </div>
                        </div>
                      </div>

                      <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight mb-3 group-hover:text-cyan-500 transition-colors line-clamp-2 uppercase tracking-tight">
                        {g.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                        {g.content}
                      </p>

                      <div className="mt-auto flex flex-wrap gap-1.5 mb-6">
                        {g.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-black uppercase tracking-tighter bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-white/5 text-gray-500">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                           {g.featured && (
                             <div className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                               <Star size={10} className="fill-amber-500" /> Featured
                             </div>
                           )}
                           {g.resourceLink && (
                             <div className="p-1 rounded-lg text-blue-500 bg-blue-500/10 border border-blue-500/20" title="External link included">
                               <Globe size={10} />
                             </div>
                           )}
                        </div>
                        <button
                          onClick={() => openEdit(g)}
                          className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Manage <ChevronRight size={10} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {Math.ceil(total / 9) > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-900/40 p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                   Displaying {guidance.length} of {total} Articles
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-cyan-500 disabled:opacity-30 transition-all shadow-inner border border-gray-100 dark:border-white/5"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-black text-gray-900 dark:text-white px-4">Page {page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 9)}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-cyan-500 disabled:opacity-30 transition-all shadow-inner border border-gray-100 dark:border-white/5"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Resource' : 'Publish Guidance'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Article Title *</label>
              <input
                type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field py-3.5 text-sm font-bold" placeholder="How to write a professional CV..." required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Primary Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="select-field py-3 text-sm font-bold"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Read Time (min)</label>
              <div className="relative">
                 <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input
                   type="number" value={form.readTime}
                   onChange={(e) => setForm({ ...form, readTime: Number(e.target.value) })}
                   className="input-field pl-12 py-3.5 text-sm font-bold" min="1"
                 />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">External Link (Optional)</label>
              <div className="relative">
                 <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input
                   type="url" value={form.resourceLink}
                   onChange={(e) => setForm({ ...form, resourceLink: e.target.value })}
                   className="input-field pl-12 py-3.5 text-sm font-bold" placeholder="https://external-resource.com"
                 />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Search Tags (comma-separated)</label>
            <div className="relative">
               <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input
                 type="text" value={form.tags}
                 onChange={(e) => setForm({ ...form, tags: e.target.value })}
                 className="input-field pl-12 py-3.5 text-sm font-bold" placeholder="cv, resume, job, application..."
               />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Detailed Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8} className="input-field resize-none py-4 text-sm leading-relaxed"
              placeholder="Write the full guide here. Use clear paragraphs for better reading..." required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-white/5">
            <input
              type="checkbox" id="gfeatured" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-5 h-5 rounded-lg accent-cyan-500 cursor-pointer"
            />
            <label htmlFor="gfeatured" className="text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
               <Star size={16} className="text-amber-500 fill-amber-500" /> Mark as Highlighted Resource
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Discard</button>
            <button
              type="submit" disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-cyan-500/20"
            >
              {saving ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <FileText size={18} />}
              {editItem ? 'Save Updates' : 'Publish Resource'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Removal" size="sm">
        <div className="text-center py-4">
           <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
              <Trash2 size={32} />
           </div>
           <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Delete this article?</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">This action cannot be undone. Users will immediately lose access to this resource.</p>
           <div className="grid grid-cols-2 gap-3 mt-10">
              <button onClick={() => setDeleteId(null)} className="btn-secondary py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button onClick={() => deleteId && handleDelete(deleteId)} className="btn-danger py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">Delete Forever</button>
           </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
