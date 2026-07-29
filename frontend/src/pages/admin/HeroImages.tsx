import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, ImageIcon, Calendar, Globe, GraduationCap } from 'lucide-react';
import { heroImageAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { getAssetUrl } from '../../utils/assetUrl';
import toast from 'react-hot-toast';

interface HeroImage {
  _id: string;
  imageUrl: string;
  altText: string;
  category: 'graduation' | 'workers';
  university?: string;
  country?: string;
  createdAt: string;
}

export default function HeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [formData, setFormData] = useState({
    altText: '',
    category: 'graduation' as 'graduation' | 'workers',
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
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file && !editingImage) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const submitData = new FormData();
      submitData.append('altText', formData.altText);
      submitData.append('category', formData.category);
      if (formData.university) submitData.append('university', formData.university);
      if (formData.country) submitData.append('country', formData.country);
      if (formData.file) {
        submitData.append('image', formData.file);
      }

      if (editingImage) {
        await heroImageAPI.update(editingImage._id, submitData);
        toast.success('Hero image updated successfully');
      } else {
        await heroImageAPI.create(submitData);
        toast.success('Hero image uploaded successfully');
      }

      fetchImages();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save hero image');
      console.error('Error saving image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero image? This will remove it from the homepage slideshow.')) return;

    try {
      await heroImageAPI.delete(id);
      toast.success('Hero image deleted');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      altText: '',
      category: 'graduation',
      university: '',
      country: '',
      file: null,
    });
    setEditingImage(null);
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
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  return (
    <AdminLayout title="Hero Images">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Manage the background slideshow images for the homepage hero section.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add New Image
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image._id} className="glass-card overflow-hidden group">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={getAssetUrl(image.imageUrl)}
                  alt={image.altText}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
                    {image.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{image.altText}</h3>
                
                <div className="space-y-2 mb-5">
                  {image.university && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <GraduationCap size={14} className="text-cyan-500" />
                      {image.university}
                    </div>
                  )}
                  {image.country && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Globe size={14} className="text-cyan-500" />
                      {image.country}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    {new Date(image.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(image)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card">
              <ImageIcon size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No hero images found in the database.</p>
              <button onClick={() => openModal()} className="mt-4 btn-primary">
                Upload First Image
              </button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingImage ? 'Edit Hero Image' : 'Add New Hero Image'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Alt Text / Caption *
            </label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              className="input-field"
              placeholder="e.g. Students graduating at UR"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'graduation' | 'workers' })}
                className="select-field"
              >
                <option value="graduation">Graduation</option>
                <option value="workers">Workers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {formData.category === 'graduation' ? 'University' : 'Country/Role'}
              </label>
              <input
                type="text"
                value={formData.category === 'graduation' ? formData.university : formData.country}
                onChange={(e) => {
                  if (formData.category === 'graduation') {
                    setFormData({ ...formData, university: e.target.value });
                  } else {
                    setFormData({ ...formData, country: e.target.value });
                  }
                }}
                className="input-field"
                placeholder={formData.category === 'graduation' ? "e.g. UR, ICK" : "e.g. Rwanda, International"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Image File {editingImage ? '(Optional)' : '*'}
            </label>
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
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-500">
                  {formData.file ? formData.file.name : 'Click to select or drag & drop'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">Recommended: 1920x1080 (JPG, PNG)</span>
              </label>
            </div>
            {editingImage && (
              <p className="text-[10px] text-cyan-500 mt-2 font-medium italic">
                Leave empty to keep current background image.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {uploading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Upload size={16} />}
              {editingImage ? 'Update Image' : 'Upload Image'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
