import { useState, ChangeEvent, FormEvent, useMemo } from 'react';
import {
  User as UserIcon, Mail, Lock, Save, Eye, EyeOff,
  CheckCircle, Camera, ShieldCheck, Activity, ChevronRight,
  Shield, AlertCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { getAssetUrl } from '../../utils/assetUrl';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { format } from 'date-fns';

type Tab = 'profile' | 'security';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Password State
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!newPw) return 0;
    let strength = 0;
    if (newPw.length >= 6) strength += 25;
    if (/[A-Z]/.test(newPw)) strength += 25;
    if (/[0-9]/.test(newPw)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPw)) strength += 25;
    return strength;
  }, [newPw]);

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
      toast.success('Profile updated successfully! ✨');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) { toast.error('Fill in all password fields'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }

    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Security updated! Password changed successfully. 🔒');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password change failed');
    }
    setChangingPw(false);
  };

  return (
    <AdminLayout title="System Administrator">
      <div className="max-w-4xl space-y-8">

        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group border-cyan-500/10 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-cyan-500/10" />

          <div className="relative flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-cyan-500/20"
            >
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || getAssetUrl(user?.avatar)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-4xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="text-white" size={32} />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </motion.div>

            {avatarFile && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-gray-900"
              >
                <CheckCircle size={16} />
              </motion.div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-2">{user?.name}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2">
                 <Mail size={14} className="text-cyan-500" /> {user?.email}
               </p>
               <span className="h-1 w-1 rounded-full bg-gray-300 hidden md:block" />
               <p className="text-xs bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                 <ShieldCheck size={12} /> Root Administrator
               </p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock size={12} /> Joined {user?.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'Recently'}
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Activity size={12} /> System Status: Online
               </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900/50 rounded-2xl w-fit border border-gray-200 dark:border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('profile')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              activeTab === 'profile' ? "bg-white dark:bg-gray-800 text-cyan-500 shadow-md scale-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-white scale-95"
            )}
          >
            <UserIcon size={14} /> My Identity
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              activeTab === 'security' ? "bg-white dark:bg-gray-800 text-cyan-500 shadow-md scale-100" : "text-gray-500 hover:text-gray-900 dark:hover:text-white scale-95"
            )}
          >
            <Shield size={14} /> Shield & Security
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-[1fr_350px] gap-8"
            >
              <div className="glass-card p-8 border-cyan-500/10">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                  <UserIcon size={20} className="text-cyan-500" /> Identity Information
                </h3>
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Public Name</label>
                      <div className="relative group">
                        <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-12 py-4 font-bold" placeholder="Full name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Email Address</label>
                      <div className="relative group">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-12 py-4 font-bold" placeholder="Email address" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="submit" disabled={saving}
                      className="btn-primary w-full md:w-auto px-10 py-4 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-cyan-500/20"
                    >
                      {saving ? <div className="w-4 h-4 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                      Update Profile Identity
                    </motion.button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                 <div className="glass-card p-6 bg-cyan-500/5 border-cyan-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-4 flex items-center gap-2">
                       <ShieldCheck size={14} /> Staff Permissions
                    </h4>
                    <ul className="space-y-3">
                       {['Access Dashboard Stats', 'Manage All Users', 'Post Announcements', 'Resolve Assistance Requests'].map((p, i) => (
                         <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            {p}
                         </li>
                       ))}
                    </ul>
                 </div>

                 <div className="glass-card p-6 border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Account Integrity</p>
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-gray-600">Verification Status</span>
                       <span className="text-green-500 flex items-center gap-1.5 uppercase tracking-tighter"><CheckCircle size={14} /> Verified Staff</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="security-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="glass-card p-8 border-cyan-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Shield size={22} className="text-cyan-500" /> Security Lockdown
                </h3>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Current Administrative Password</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type={showPw ? 'text' : 'password'} value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="input-field pl-12 py-4 font-bold" placeholder="••••••••"
                      />
                      <button
                        type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100 dark:border-white/5" />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">New Password</label>
                      <div className="relative group">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                          type={showPw ? 'text' : 'password'} value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          className="input-field pl-12 py-4 font-bold" placeholder="Min. 6 chars"
                        />
                      </div>

                      {/* Strength Meter */}
                      <div className="space-y-1 mt-3">
                         <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-400 tracking-widest">
                            <span>Security Strength</span>
                            <span className={clsx(
                              passwordStrength <= 25 ? 'text-red-500' :
                              passwordStrength <= 50 ? 'text-amber-500' :
                              passwordStrength <= 75 ? 'text-blue-500' : 'text-green-500'
                            )}>
                              {passwordStrength <= 25 ? 'Weak' :
                               passwordStrength <= 50 ? 'Fair' :
                               passwordStrength <= 75 ? 'Good' : 'Strong'}
                            </span>
                         </div>
                         <div className="h-1 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                            {[25, 50, 75, 100].map(level => (
                              <div key={level} className={clsx(
                                "flex-1 h-full rounded-full transition-all duration-500",
                                passwordStrength >= level ? (
                                  passwordStrength <= 25 ? 'bg-red-500' :
                                  passwordStrength <= 50 ? 'bg-amber-500' :
                                  passwordStrength <= 75 ? 'bg-blue-500' : 'bg-green-500'
                                ) : 'bg-transparent'
                              )} />
                            ))}
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Confirm Security Code</label>
                      <div className="relative group">
                        <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                          type={showPw ? 'text' : 'password'} value={confirmPw}
                          onChange={(e) => setConfirmPw(e.target.value)}
                          className={clsx(
                            "input-field pl-12 py-4 font-bold transition-all",
                            confirmPw && newPw !== confirmPw ? "border-red-500 focus:ring-red-500/20" : ""
                          )}
                          placeholder="Repeat password"
                        />
                      </div>
                      {confirmPw && newPw !== confirmPw && (
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> Mismatching passwords
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit" disabled={changingPw || !newPw || newPw !== confirmPw}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-cyan-500/30"
                    >
                      {changingPw ? <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" /> : <ShieldCheck size={20} />}
                      Lock In New Password
                    </motion.button>
                  </div>
                </form>

                <div className="mt-8 flex items-start gap-4 p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
                   <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <AlertCircle size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-tighter mb-1">Administrative Note</p>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-medium">Changing your password will invalidate your current session. You may need to log in again on other devices.</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
