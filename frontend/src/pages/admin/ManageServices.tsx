import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, LayoutGrid, Search,
  GraduationCap, Landmark, FileEdit, Compass,
  Palette, Code, Briefcase, Info, List, ArrowUp, ArrowDown, Save
} from 'lucide-react';
import { serviceAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  _id: string;
  title: string;
  iconName: string;
  features: string[];
  order: number;
}

const ICON_OPTIONS = [
  { name: 'GraduationCap', icon: <GraduationCap size={16} /> },
  { name: 'Landmark', icon: <Landmark size={16} /> },
  { name: 'FileEdit', icon: <FileEdit size={16} /> },
  { name: 'Compass', icon: <Compass size={16} /> },
  { name: 'Palette', icon: <Palette size={16} /> },
  { name: 'Code', icon: <Code size={16} /> },
  { name: 'Briefcase', icon: <Briefcase size={16} /> },
  { name: 'Info', icon: <Info size={16} /> },
];

const EMPTY_FORM = {
  title: '',
  iconName: 'GraduationCap',
  features: [''],
  order: 0
};

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAll();
      setServices(res.data.services);
    } catch {
      toast.error('Failed to load services');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, order: services.length + 1 });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      iconName: s.iconName,
      features: s.features.length > 0 ? [...s.features] : [''],
      order: s.order
    });
    setEditItem(s);
    setModalOpen(true);
  };

  const addFeatureRow = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeatureRow = (idx: number) => {
    const newFeatures = form.features.filter((_, i) => i !== idx);
    setForm({ ...form, features: newFeatures.length > 0 ? newFeatures : [''] });
  };
  const updateFeature = (idx: number, val: string) => {
    const newFeatures = [...form.features];
    newFeatures[idx] = val;
    setForm({ ...form, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = form.features.map(f => f.trim()).filter(Boolean);
    if (filteredFeatures.length === 0) {
      toast.error('At least one feature is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, features: filteredFeatures };
      if (editItem) {
        await serviceAPI.update(editItem._id, payload);
        toast.success('Service updated!');
      } else {
        await serviceAPI.create(payload);
        toast.success('Service created!');
      }
      setModalOpen(false);
      fetchServices();
    } catch {
      toast.error('Failed to save service');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await serviceAPI.delete(id);
      toast.success('Service removed');
      setDeleteId(null);
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const getIcon = (name: string) => {
    const option = ICON_OPTIONS.find(o => o.name === name);
    return option ? option.icon : <LayoutGrid size={16} />;
  };

  return (
    <AdminLayout title="Manage Services">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        <p className="text-gray-600 dark:text-gray-400">Define and organize the services offered on the public platform.</p>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {services.map((s, idx) => (
              <motion.div
                key={s._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-6 flex flex-col group relative overflow-hidden hover:border-cyan-500/30 transition-all"
              >
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-cyan-500 shadow-xl border border-gray-100 dark:border-white/10 transition-all"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(s._id)} className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 shadow-xl border border-gray-100 dark:border-white/10 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-5">
                   <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-inner">
                      {getIcon(s.iconName)}
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Order: {s.order}</span>
                      <h3 className="font-black text-gray-900 dark:text-white text-base leading-tight uppercase tracking-tight">{s.title}</h3>
                   </div>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                       <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest">
                      <List size={10} /> {s.features.length} Features
                   </div>
                   <button onClick={() => openEdit(s)} className="text-[9px] font-black uppercase text-gray-400 hover:text-cyan-500 transition-colors">Edit Details</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Service' : 'Define New Service'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Service Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field py-3.5 text-sm font-bold" placeholder="e.g. Design Services" required />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Display Icon *</label>
                <div className="grid grid-cols-4 gap-2">
                   {ICON_OPTIONS.map(opt => (
                     <button
                       key={opt.name} type="button" onClick={() => setForm({...form, iconName: opt.name})}
                       className={clsx("p-3 rounded-xl border transition-all flex items-center justify-center", form.iconName === opt.name ? "bg-cyan-500 border-cyan-500 text-white shadow-lg" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400 hover:border-cyan-500/30")}
                       title={opt.name}
                     >
                        {opt.icon}
                     </button>
                   ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Display Order</label>
                <div className="relative group">
                   <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="input-field py-3.5 text-sm font-bold" min="1" />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col text-gray-400">
                      <ArrowUp size={10} /><ArrowDown size={10} />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Service Features *</label>
                <button type="button" onClick={addFeatureRow} className="text-[10px] font-black uppercase text-cyan-500 flex items-center gap-1 hover:underline">
                   <Plus size={10} /> Add Feature
                </button>
             </div>
             <div className="space-y-3">
                {form.features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                     <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <input
                          type="text" value={feat} onChange={e => updateFeature(idx, e.target.value)}
                          className="input-field pl-9 py-3.5 text-sm font-bold" placeholder="Describe a sub-service or feature..." required
                        />
                     </div>
                     <button
                       type="button" onClick={() => removeFeatureRow(idx)}
                       className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5 sticky bottom-0 bg-white dark:bg-gray-900 pb-2">
             <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Discard</button>
             <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-cyan-500/20">
                {saving ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                {editItem ? 'Save Updates' : 'Publish Service'}
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
           <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Delete this service?</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">This will remove the service from the public website immediately.</p>
           <div className="grid grid-cols-2 gap-3 mt-10">
              <button onClick={() => setDeleteId(null)} className="btn-secondary py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button onClick={() => deleteId && handleDelete(deleteId)} className="btn-danger py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">Delete Forever</button>
           </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
