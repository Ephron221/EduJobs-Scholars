import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, GraduationCap, Search, Globe, Star, Paperclip } from 'lucide-react';
import { universityAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import FileUploadPanel from '../../components/FileUploadPanel';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface DocEntry { name: string; url: string; uploadedAt: string }
interface University {
  _id: string; name: string; country: string; website: string;
  description: string; logoUrl: string; featured: boolean;
  images: string[]; documents: DocEntry[];
}

const EMPTY: Omit<University, '_id'> = {
  name: '', country: '', website: '', description: '', logoUrl: '',
  featured: false, images: [], documents: [],
};

type Tab = 'details' | 'files';

export default function ManageUniversities() {
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<University | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await universityAPI.getAll({ search, limit: 100 });
      setUnis(res.data.universities);
    } catch { /* silent */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setForm(EMPTY); setEditItem(null); setActiveTab('details'); setModalOpen(true);
  };
  const openEdit = (u: University) => {
    setForm({
      name: u.name, country: u.country, website: u.website, description: u.description,
      logoUrl: u.logoUrl, featured: u.featured,
      images: u.images || [], documents: u.documents || [],
    });
    setEditItem(u); setActiveTab('details'); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await universityAPI.update(editItem._id, form);
        toast.success('University updated!');
      } else {
        await universityAPI.create(form);
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

  // Refresh the edit item after file upload/delete to reflect new file list
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
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities..." className="input-field pl-9 py-2.5" />
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add University
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">University</th>
                  <th className="table-header">Country</th>
                  <th className="table-header">Website</th>
                  <th className="table-header">Files</th>
                  <th className="table-header">Featured</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unis.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-500 dark:text-gray-400">No universities found</td></tr>
                ) : unis.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-900 to-gray-900 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-400">{u.country}</td>
                    <td className="table-cell">
                      <a href={u.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs">
                        <Globe size={12} /> Visit
                      </a>
                    </td>
                    <td className="table-cell">
                      {fileCount(u) > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                          <Paperclip size={11} /> {fileCount(u)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {u.featured
                        ? <span className="text-yellow-400 flex items-center gap-1 text-xs"><Star size={12} /> Yes</span>
                        : <span className="text-gray-600 dark:text-gray-400 text-xs">No</span>}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteId(u._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">University Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. University of Rwanda" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country *</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field" placeholder="e.g. Rwanda" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Official Website *</label>
              <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field" placeholder="https://..." required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
              <input type="url" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Brief description..." required />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
              <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><Star size={14} className="text-yellow-400" /> Mark as featured</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <GraduationCap size={15} />}
                {editItem ? 'Save Changes' : 'Add University'}
              </button>
            </div>
            {!editItem && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                You can upload images &amp; PDFs after creating the university.
              </p>
            )}
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
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Are you sure you want to delete this university? This will also affect linked programs.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
