import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Briefcase } from 'lucide-react';
import { successStoryAPI } from '../../api';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';

interface SuccessStory {
  _id: string;
  fullName: string;
  type: 'student' | 'worker';
  profileImage: string;
  howTheyKnow: string;
  howHelped: string;
  createdAt: string;
}

export default function SuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    type: 'student' as 'student' | 'worker',
    profileImage: null as File | null,
    howTheyKnow: '',
    howHelped: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await successStoryAPI.getAll();
      setStories(response.data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
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
      } else {
        await successStoryAPI.create(submitData);
      }

      fetchStories();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this success story?')) return;

    try {
      await successStoryAPI.delete(id);
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      type: 'student',
      profileImage: null,
      howTheyKnow: '',
      howHelped: '',
    });
    setEditingStory(null);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Success Stories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage student and worker success stories</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Story
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div key={story._id} className="glass-card p-4">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={story.profileImage}
                alt={story.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/20"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{story.fullName}</h3>
                <div className="flex items-center gap-1 text-sm text-cyan-400">
                  {story.type === 'student' ? <User size={14} /> : <Briefcase size={14} />}
                  {story.type === 'student' ? 'Student' : 'Worker'}
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic line-clamp-2">
              "{story.howTheyKnow}"
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
              {story.howHelped}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => openModal(story)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(story._id)}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-16 glass-card">
          <User size={48} className="text-gray-700 dark:text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">No success stories yet</p>
          <button onClick={() => openModal()} className="btn-primary">
            Add Your First Story
          </button>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStory ? 'Edit Story' : 'Add Story'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'student' | 'worker' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="worker">Worker</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required={!editingStory}
            />
            {editingStory && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to keep current image
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How They Know EduJobs Scholars
            </label>
            <textarea
              value={formData.howTheyKnow}
              onChange={(e) => setFormData({ ...formData, howTheyKnow: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Through a friend, social media, school presentation..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How EduJobs Scholars Helped
            </label>
            <textarea
              value={formData.howHelped}
              onChange={(e) => setFormData({ ...formData, howHelped: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe how EduJobs Scholars helped them achieve their goals..."
              required
            />
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
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? <Loader /> : <Plus size={16} />}
              {editingStory ? 'Update' : 'Add'} Story
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}