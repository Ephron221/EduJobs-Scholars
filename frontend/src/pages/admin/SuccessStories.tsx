import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, User, Briefcase, Image as ImageIcon, MessageSquare, Heart, Search, X } from 'lucide-react';
import { successStoryAPI } from '../../api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { getAssetUrl } from '../../utils/assetUrl';
import clsx from 'clsx';

interface SuccessStory {
  _id: string;
  fullName: string;
  type: 'student' | 'worker';
  profileImage: string;
  howTheyKnow: string;
  howHelped: string;
  createdAt: string;
}

const INITIAL_FORM = {
  fullName: '',
  type: 'student' as 'student' | 'worker',
  profileImage: null as File | null,
  howTheyKnow: '',
  howHelped: '',
};

export default function SuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await successStoryAPI.getAll();
      setStories(response.data.stories);
    } catch (error) {
      toast.error('Failed to load success stories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profileImage: file });
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('type', formData.type);
      submitData.append('howTheyKnow', formData.howTheyKnow);
      submitData.append('howHelped', formData.howHelped);
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      if (editingStory) {
        await successStoryAPI.update(editingStory._id, submitData);
        toast.success('Success story updated!');
      } else {
        await successStoryAPI.create(submitData);
        toast.success('Success story added!');
      }

      fetchStories();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save success story');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this success story?')) return;

    try {
      await successStoryAPI.delete(id);
      toast.success('Story deleted successfully');
      fetchStories();
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStory(null);
    setFormData(INITIAL_FORM);
    setPreviewUrl(null);
  };

  const openModal = (story?: SuccessStory) => {
    if (story) {
      setEditingStory(story);
      setFormData({
        fullName: story.fullName,
        type: story.type,
        profileImage: null,
        howTheyKnow: story.howTheyKnow,
        howHelped: story.howHelped,
      });
      setPreviewUrl(getAssetUrl(story.profileImage) || null);
    } else {
      setFormData(INITIAL_FORM);
      setPreviewUrl(null);
    }
    setShowModal(true);
  };

  const filteredStories = stories.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.howHelped.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Success Stories">
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search stories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Success Story
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div key={story._id} className="glass-card group flex flex-col overflow-hidden transition-all hover:shadow-xl hover:shadow-cyan-500/5">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={getAssetUrl(story.profileImage)}
                      alt={story.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-cyan-500/20"
                    />
                    <div className={clsx(
                      "absolute -bottom-1 -right-1 p-1.5 rounded-lg shadow-lg",
                      story.type === 'student' ? "bg-blue-500" : "bg-purple-500"
                    )}>
                      {story.type === 'student' ? <User size={12} className="text-white" /> : <Briefcase size={12} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight">{story.fullName}</h3>
                    <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mt-1">
                      {story.type === 'student' ? 'Student' : 'Worker'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MessageSquare size={16} className="text-gray-400 shrink-0 mt-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
                      "{story.howTheyKnow}"
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Heart size={16} className="text-cyan-500 shrink-0 mt-1" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed">
                      {story.howHelped}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex gap-3">
                <button
                  onClick={() => openModal(story)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(story._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredStories.length === 0 && (
        <div className="text-center py-24 glass-card">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Success Stories Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
            {search ? `No stories matching "${search}"` : "You haven't added any success stories yet. Start by sharing an inspiring journey!"}
          </p>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus size={18} className="inline mr-2" /> Add Your First Story
          </button>
        </div>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        title={editingStory ? 'Edit Success Story' : 'Add New Success Story'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Esron TUYISHIMIRE"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Story Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['student', 'worker'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={clsx(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all",
                        formData.type === t 
                          ? "bg-cyan-500 border-cyan-500 text-black" 
                          : "border-gray-200 dark:border-white/10 text-gray-500 hover:border-cyan-500/50"
                      )}
                    >
                      {t === 'student' ? <User size={16} /> : <Briefcase size={16} />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Profile Image *
                </label>
                <div className="relative group">
                  <div className={clsx(
                    "w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
                    previewUrl ? "border-cyan-500/50" : "border-gray-300 dark:border-white/10 hover:border-cyan-500/50"
                  )}>
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <ImageIcon className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">Click to upload photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required={!editingStory}
                    />
                  </div>
                  {editingStory && (
                    <p className="text-[10px] text-gray-500 mt-2 italic font-medium">
                      Note: Leave empty to keep the current profile picture.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  How They Discovered Us *
                </label>
                <textarea
                  value={formData.howTheyKnow}
                  onChange={(e) => setFormData({ ...formData, howTheyKnow: e.target.value })}
                  rows={4}
                  className="input-field resize-none h-32"
                  placeholder="e.g., Through a friend, social media, or school presentation..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  Their Success Story *
                </label>
                <textarea
                  value={formData.howHelped}
                  onChange={(e) => setFormData({ ...formData, howHelped: e.target.value })}
                  rows={6}
                  className="input-field resize-none h-[156px]"
                  placeholder="Describe how EduJobs Scholars helped them achieve their goals..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 rounded-2xl bg-cyan-500 text-black font-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
              ) : editingStory ? (
                <><Pencil size={18} /> Update Story</>
              ) : (
                <><Plus size={18} /> Publish Story</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
