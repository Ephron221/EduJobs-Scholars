import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { heroImageAPI } from '../../api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import { getAssetUrl } from '../../utils/assetUrl';

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
    try {
      const response = await heroImageAPI.getAll();
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file && !editingImage) return;

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
      } else {
        await heroImageAPI.create(submitData);
      }

      fetchImages();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await heroImageAPI.delete(id);
      fetchImages();
    } catch (error) {
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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Images</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage homepage hero carousel images</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image._id} className="glass-card p-4">
            <div className="aspect-video mb-4 overflow-hidden rounded-lg">
              <img
                src={getAssetUrl(image.imageUrl)}
                alt={image.altText}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">{image.altText}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Uploaded: {new Date(image.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(image)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(image._id)}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-16 glass-card">
          <Upload size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No hero images yet</p>
          <button onClick={() => openModal()} className="btn-primary">
            Add Your First Image
          </button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingImage ? 'Edit Image' : 'Add Image'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alt Text / Caption
            </label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'graduation' | 'workers' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="graduation">Graduation</option>
              <option value="workers">Workers</option>
            </select>
          </div>

          {formData.category === 'graduation' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                University (optional)
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. UR, ICK, CUR"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country/Role (optional)
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. Rwanda, International"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required={!editingImage}
            />
            {editingImage && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to keep current image
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
              {uploading ? <Loader /> : <Upload size={16} />}
              {editingImage ? 'Update' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}