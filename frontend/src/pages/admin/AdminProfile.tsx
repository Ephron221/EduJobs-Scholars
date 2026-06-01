import { useState, ChangeEvent, FormEvent } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      if (avatarFile) {
        setAvatarFile(null);
        setAvatarPreview('');
      }
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      toast.error((err as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) { toast.error('Fill in both password fields'); return; }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw('');
    } catch (err: unknown) {
      toast.error((err as {response?: {data?: {message?: string}}})?.response?.data?.message || 'Password change failed');
    }
    setChangingPw(false);
  };

  return (
    <AdminLayout title="My Profile">
      <div className="max-w-2xl space-y-6">
        <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarPreview || user?.avatar ? (
              <img
                src={avatarPreview || user?.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border border-cyan-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-black text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label htmlFor="avatar" className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white border border-gray-200 shadow-sm text-cyan-500 hover:bg-cyan-50 cursor-pointer">
              <Camera size={18} />
            </label>
            <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                Administrator
              </span>
            </div>
            {avatarFile && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Selected file: {avatarFile.name}</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-cyan-400" /> Personal Information
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              Save Changes
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={18} className="text-cyan-400" /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-field pl-10" placeholder="Min. 6 characters" />
              </div>
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary flex items-center gap-2 py-2.5 px-5">
              {changingPw ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={15} />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
