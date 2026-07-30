import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit, Trash2, Upload, ImageIcon, Calendar,
  Globe, GraduationCap, Tag, Search, LayoutGrid,
  Filter, CheckCircle2, AlertCircle
} from 'lucide-react';
import { heroImageAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { getAssetUrl } from '../../utils/assetUrl';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroImage {
  _id: string;
  imageUrl: string;
  altText: string;
  category: string;
  university?: string;
  country?: string;
  createdAt: string;
}

export default function HeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [formData, setFormData] = useState({
    altText: '',
    category: '',
    university: '',
    country: '',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await heroImageAPI.getAll();
      setImages(response.data.images);
    } catch (error) {
      toast.error('Failed to fetch hero images');
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(images.map(img => {
      const c = img.category.trim();
      return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    }));
    return Array.from(cats).sort();
  }, [images]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    images.forEach(img => {
      const c = img.category.trim();
      const normalized = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      s[normalized] = (s[normalized] || 0) + 1;
    });
    return s;
  }, [images]);

  const filteredImages = images.filter(img => {
    const matchesSearch = img.altText.toLowerCase().includes(search.toLowerCase()) ||
                          img.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCat || img.category.toLowerCase() === filterCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file && !editingImage) {
      toast.error('Please select an image file');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Please provide a category');
      return;
    }

    setUploading(true);
    try {
      const submitData = new FormData();
      submitData.append('altText', formData.altText);
      submitData.append('category', formData.category.trim());
      if (formData.university) submitData.append('university', formData.university);
      if (formData.country) submitData.append('country', formData.country);
      if (formData.file) {
        submitData.append('image', formData.file);
      }

      if (editingImage) {
        await heroImageAPI.update(editingImage._id, submitData);
        toast.success('Hero image updated!');
      } else {
        await heroImageAPI.create(submitData);
        toast.success('Hero image uploaded!');
      }

      fetchImages();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save hero image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hero image from the homepage slideshow?')) return;
    try {
      await heroImageAPI.delete(id);
      toast.success('Hero image removed');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const resetForm = () => {
    setFormData({
      altText: '',
      category: '',
      university: '',
      country: '',
      file: null,
    });
    setEditingImage(null);
    setIsCustomCategory(false);
  };

  const openModal = (image?: HeroImage) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        altText: image.altText,
        category: image.category,
        university: image.university || '',
        country: image.country || '',
        file: null,
      });
      setIsCustomCategory(false);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  return (
    <AdminLayout title="Hero Images">
      <div className="space-y-8">

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => setFilterCat('')}
            className={clsx(
              "glass-card p-4 flex flex-col justify-between cursor-pointer border-transparent transition-all",
              filterCat === '' ? "ring-2 ring-cyan-500 bg-cyan-500/5" : "hover:bg-white/5"
            )}
          >
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Images</p>
            <div className="flex items-center justify-between mt-2">
               <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">{images.length}</span>
               <LayoutGrid size={16} className="text-cyan-500" />
            </div>
          </motion.div>

          {Object.entries(stats).map(([cat, count]) => (
            <motion.div
              key={cat}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilterCat(cat)}
              className={clsx(
                "glass-card p-4 flex flex-col justify-between cursor-pointer border-transparent transition-all",
                filterCat === cat ? "ring-2 ring-cyan-500 bg-cyan-500/5" : "hover:bg-white/5"
              )}
            >
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest truncate">{cat}</p>
              <div className="flex items-center justify-between mt-2">
                 <span className="text-2xl font-black text-cyan-500 leading-none">{count}</span>
                 <Tag size={14} className="text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900/40 p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex flex-1 w-full gap-3">
            <div className="relative flex-1 max-w-md group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search captions or categories..."
                className="input-field pl-12 py-3 text-sm font-bold bg-white dark:bg-gray-800"
              />
            </div>
            {categories.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/5">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 text-gray-600 dark:text-gray-400 outline-none"
                >
                  <option value="">All Activities</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> Add Image
          </button>
        </div>

        {loading ? <div className="py-20"><Loader /></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image) => (
                <motion.div
                  key={image._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card overflow-hidden group border-white/10"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getAssetUrl(image.imageUrl)}
                      alt={image.altText}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black shadow-lg">
                        {image.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(image)}
                          className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-cyan-500 hover:text-black transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(image._id)}
                          className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-gray-900 dark:text-white mb-4 line-clamp-1 uppercase tracking-tight text-sm">{image.altText}</h3>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Source</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">
                           <GraduationCap size={12} className="text-cyan-500" />
                           {image.university || 'N/A'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Region</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">
                           <Globe size={12} className="text-cyan-500" />
                           {image.country || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(image.createdAt).toLocaleDateString()}</span>
                       <span className="text-cyan-500/80">Active</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredImages.length === 0 && (
              <div className="col-span-full py-24 text-center glass-card border-dashed">
                <ImageIcon size={64} className="text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No images found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Try different keywords or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingImage ? 'Modify Activity Image' : 'New Platform Image'} size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Alt Text / Caption *</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              className="input-field py-4 text-sm font-bold"
              placeholder="e.g. Community workshop at University of Rwanda"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                Activity Category *
              </label>

              <AnimatePresence mode="wait">
                {isCustomCategory ? (
                  <motion.div
                    key="custom-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative group"
                  >
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
                    <input
                      type="text"
                      autoFocus
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field pl-12 py-3.5 text-sm font-bold border-cyan-500/50"
                      placeholder="Type activity name..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-cyan-500 hover:underline"
                    >
                      Back
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="select-input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setFormData({ ...formData, category: '' });
                        } else {
                          setFormData({ ...formData, category: e.target.value });
                        }
                      }}
                      className="select-field pl-12 py-3.5 text-sm font-bold"
                      required
                    >
                      <option value="">Select Activity</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="__custom__" className="text-cyan-500 font-bold">+ Add New Activity</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Categorize images by activity type</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">University/Role</label>
              <div className="relative group">
                <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="input-field pl-12 py-3.5 text-sm font-bold"
                  placeholder="e.g. UR, ICK"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Target Country / region</label>
            <div className="relative group">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field pl-12 py-3.5 text-sm font-bold"
                placeholder="e.g. Rwanda, East Africa"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Background Image {editingImage ? '(Optional)' : '*'}</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                className="hidden"
                id="hero-file-upload"
                required={!editingImage}
              />
              <label
                htmlFor="hero-file-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] transition-all relative overflow-hidden"
              >
                {formData.file ? (
                   <div className="flex flex-col items-center animate-fade-in">
                      <CheckCircle2 size={32} className="text-cyan-500 mb-2" />
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{formData.file.name}</span>
                   </div>
                ) : (
                  <>
                    <Upload size={32} className="text-gray-300 mb-3" />
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Image Asset</span>
                    <span className="text-[10px] text-gray-400 mt-2 font-bold">1920x1080 Recommended</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-cyan-500/20"
            >
              {uploading ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <Upload size={18} />}
              {editingImage ? 'Save Updates' : 'Upload Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
