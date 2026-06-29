import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Users, UserCheck, UserX, Trash2, Shield, TrendingUp, TrendingDown,
  ChevronDown, Edit3, X, Save, Mail, Calendar, CheckCircle2, XCircle,
  UserPlus, Activity, Eye, Briefcase, GraduationCap, BadgeCheck
} from 'lucide-react';
import { userAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

/* ───────── Types ───────── */
interface User {
  _id: string; name: string; email: string; role: string;
  isActive: boolean; isVerified?: boolean; avatar?: string;
  savedOpportunities: unknown[]; createdAt: string;
}

interface UserStats {
  totalUsers: number; studentCount: number; jobseekerCount: number; adminCount: number;
  activeCount: number; disabledCount: number; verifiedCount: number; unverifiedCount: number;
  newThisMonth: number; newLastMonth: number; growthPercent: number;
}

/* ───────── Animated counter hook ───────── */
function useAnimatedCount(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);
  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (target === 0) { setCount(0); return; }
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

/* ───────── Skeleton loaders ───────── */
function StatSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="w-12 h-8 rounded bg-gray-200 dark:bg-white/10 mb-1" />
      <div className="w-24 h-4 rounded bg-gray-200 dark:bg-white/10" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="table-cell"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10" /><div><div className="w-28 h-4 rounded bg-gray-200 dark:bg-white/10 mb-1.5" /><div className="w-36 h-3 rounded bg-gray-200 dark:bg-white/10" /></div></div></td>
      <td className="table-cell"><div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10" /></td>
      <td className="table-cell"><div className="w-14 h-5 rounded-full bg-gray-200 dark:bg-white/10" /></td>
      <td className="table-cell"><div className="w-6 h-4 rounded bg-gray-200 dark:bg-white/10" /></td>
      <td className="table-cell"><div className="w-20 h-4 rounded bg-gray-200 dark:bg-white/10" /></td>
      <td className="table-cell text-right"><div className="flex justify-end gap-2"><div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10" /><div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10" /><div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-white/10" /></div></td>
    </tr>
  );
}

/* ───────── Stat Card ───────── */
function StatCard({ icon, label, value, gradient, trend, trendLabel, delay = 0 }: {
  icon: React.ReactNode; label: string; value: number; gradient: string;
  trend?: number; trendLabel?: string; delay?: number;
}) {
  const animatedValue = useAnimatedCount(value);
  return (
    <div
      className="glass-card p-5 group hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
      style={{ animationDelay: `${delay}ms`, animation: 'fadeInUp 0.5s ease both' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110', gradient)}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1',
            trend >= 0 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-400'
          )}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{animatedValue}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
      {trendLabel && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{trendLabel}</div>}
    </div>
  );
}

/* ───────── Mini Stat Pill ───────── */
function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const animatedValue = useAnimatedCount(value, 700);
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 transition-all hover:border-cyan-500/30 hover:shadow-sm">
      <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', color)}>{icon}</div>
      <div>
        <div className="text-sm font-bold text-gray-900 dark:text-white">{animatedValue}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">{label}</div>
      </div>
    </div>
  );
}

/* ───────── Role Dropdown ───────── */
function RoleDropdown({ currentRole, userId, currentUserId, onRoleChanged }: {
  currentRole: string; userId: string; currentUserId: string;
  onRoleChanged: (userId: string, newRole: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isSelf = userId === currentUserId;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roles = [
    { value: 'student', label: 'Student', icon: <GraduationCap size={13} />, color: 'bg-gray-200/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
    { value: 'jobseeker', label: 'Jobseeker', icon: <Briefcase size={13} />, color: 'bg-purple-500/20 text-purple-600 dark:text-purple-300' },
    { value: 'admin', label: 'Admin', icon: <Shield size={13} />, color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300' },
  ];

  const current = roles.find(r => r.value === currentRole) || roles[0];

  const handleChange = async (newRole: string) => {
    if (newRole === currentRole) { setOpen(false); return; }
    if (isSelf) { toast.error('You cannot change your own role'); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await userAPI.updateRole(userId, newRole);
      toast.success(res.data.message);
      onRoleChanged(userId, newRole);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !loading && setOpen(!open)}
        disabled={loading}
        className={clsx(
          'text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 w-fit capitalize transition-all duration-200',
          current.color,
          !isSelf && 'cursor-pointer hover:ring-2 hover:ring-cyan-500/30',
          isSelf && 'cursor-default',
          loading && 'opacity-60'
        )}
      >
        {current.icon}
        {loading ? 'Updating...' : current.label}
        {!isSelf && <ChevronDown size={11} className={clsx('transition-transform', open && 'rotate-180')} />}
      </button>

      {open && !isSelf && (
        <div className="absolute top-full left-0 mt-1.5 w-40 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/15 shadow-xl shadow-black/20 z-50 overflow-hidden animate-slide-up">
          {roles.map(r => (
            <button
              key={r.value}
              onClick={() => handleChange(r.value)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors capitalize',
                r.value === currentRole
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              {r.icon}
              {r.label}
              {r.value === currentRole && <CheckCircle2 size={12} className="ml-auto text-cyan-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── Edit User Modal ───────── */
function EditUserModal({ user, isOpen, onClose, onSaved, currentUserId }: {
  user: User | null; isOpen: boolean; onClose: () => void;
  onSaved: (updated: User) => void; currentUserId: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); setRole(user.role); }
  }, [user]);

  if (!user) return null;
  const isSelf = user._id === currentUserId;

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { toast.error('Name and email are required'); return; }
    setSaving(true);
    try {
      // Build update payload
      const payload: Record<string, string> = { name: name.trim(), email: email.trim() };

      // If role changed and not self, update role separately
      if (role !== user.role && !isSelf) {
        await userAPI.updateRole(user._id, role);
      }

      const res = await userAPI.update(user._id, payload);
      toast.success('User profile updated');
      onSaved({ ...res.data.user, role: role !== user.role && !isSelf ? role : res.data.user.role });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update user');
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Profile" size="md">
      <div className="space-y-5">
        {/* User header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10">
          <div className={clsx(
            'w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-lg',
            user.role === 'admin' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black' :
            user.role === 'jobseeker' ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' :
            'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
          )}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium',
                user.isActive ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-400'
              )}>
                {user.isActive ? '● Active' : '○ Disabled'}
              </span>
              <span className={clsx('text-[10px] px-2 py-0.5 rounded-full font-medium',
                user.isVerified ? 'bg-blue-500/15 text-blue-500' : 'bg-amber-500/15 text-amber-500'
              )}>
                {user.isVerified ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="input-field py-2.5" placeholder="Full name" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="input-field py-2.5" placeholder="Email address" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
            Role {isSelf && <span className="text-amber-500 normal-case">(cannot change own role)</span>}
          </label>
          <select
            value={role} onChange={e => setRole(e.target.value)}
            disabled={isSelf}
            className={clsx('select-field w-full py-2.5', isSelf && 'opacity-60 cursor-not-allowed')}
          >
            <option value="student">Student</option>
            <option value="jobseeker">Jobseeker</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={13} className="text-gray-400" />
            Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Eye size={13} className="text-gray-400" />
            {user.savedOpportunities?.length || 0} saved items
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <X size={15} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 font-semibold disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ search, role: filterRole || undefined, limit: 100 });
      setUsers(res.data.users);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filterRole]);

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await userAPI.getStats();
      setStats(res.data);
    } catch { /* silent */ }
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── Actions ── */
  const handleToggle = async (id: string) => {
    try {
      const res = await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
      fetchStats(); // refresh stats
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
      fetchStats();
    } catch { toast.error('Failed to delete'); }
  };

  const handleRoleChanged = (userId: string, newRole: string) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    fetchStats();
  };

  const handleUserSaved = (updated: User) => {
    setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
    fetchStats();
  };

  return (
    <AdminLayout title="Manage Users">
      {/* ── CSS keyframes for entrance animations ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .row-animate {
          animation: fadeInRow 0.35s ease both;
        }
      `}</style>

      {/* ═══════ STATS CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : stats && (
          <>
            <StatCard
              icon={<Users size={20} className="text-white" />}
              gradient="bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30"
              label="Total Users"
              value={stats.totalUsers}
              trend={stats.growthPercent}
              trendLabel={`${stats.newThisMonth} new this month`}
              delay={0}
            />
            <StatCard
              icon={<GraduationCap size={20} className="text-white" />}
              gradient="bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30"
              label="Students"
              value={stats.studentCount}
              trendLabel={stats.totalUsers > 0 ? `${Math.round((stats.studentCount / stats.totalUsers) * 100)}% of total` : ''}
              delay={80}
            />
            <StatCard
              icon={<Briefcase size={20} className="text-white" />}
              gradient="bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30"
              label="Jobseekers"
              value={stats.jobseekerCount}
              trendLabel={stats.totalUsers > 0 ? `${Math.round((stats.jobseekerCount / stats.totalUsers) * 100)}% of total` : ''}
              delay={160}
            />
            <StatCard
              icon={<Shield size={20} className="text-white" />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30"
              label="Admins"
              value={stats.adminCount}
              trendLabel={stats.totalUsers > 0 ? `${Math.round((stats.adminCount / stats.totalUsers) * 100)}% of total` : ''}
              delay={240}
            />
          </>
        )}
      </div>

      {/* ═══════ MINI STATS ROW ═══════ */}
      {!statsLoading && stats && (
        <div className="flex flex-wrap gap-3 mb-6" style={{ animation: 'fadeInUp 0.5s ease 0.3s both' }}>
          <MiniStat icon={<Activity size={14} className="text-emerald-500" />} label="Active" value={stats.activeCount} color="bg-emerald-500/10" />
          <MiniStat icon={<XCircle size={14} className="text-red-400" />} label="Disabled" value={stats.disabledCount} color="bg-red-500/10" />
          <MiniStat icon={<BadgeCheck size={14} className="text-blue-500" />} label="Verified" value={stats.verifiedCount} color="bg-blue-500/10" />
          <MiniStat icon={<UserPlus size={14} className="text-cyan-500" />} label="New this month" value={stats.newThisMonth} color="bg-cyan-500/10" />
        </div>
      )}

      {/* ═══════ SEARCH & FILTER BAR ═══════ */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-5" style={{ animation: 'fadeInUp 0.5s ease 0.35s both' }}>
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-9 py-2.5"
            />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="select-field w-36">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="jobseeker">Jobseeker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users size={15} />
          <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span> users
          {filterRole && <span className="text-xs text-cyan-500 ml-1">({filterRole})</span>}
        </div>
      </div>

      {/* ═══════ USERS TABLE ═══════ */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Saved</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden" style={{ animation: 'fadeInUp 0.5s ease 0.4s both' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Saved</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Users size={28} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : users.map((u, idx) => (
                  <tr
                    key={u._id}
                    className="row-animate hover:bg-gray-50/80 dark:hover:bg-white/[0.03] transition-all duration-200 border-b border-gray-100 dark:border-white/5 last:border-0 group/row"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* User info */}
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform duration-200 group-hover/row:scale-110',
                          u.role === 'admin' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black' :
                          u.role === 'jobseeker' ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' :
                          'bg-gradient-to-br from-gray-600 to-gray-800 text-white'
                        )}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                            <Mail size={10} className="shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role (inline dropdown) */}
                    <td className="table-cell">
                      <RoleDropdown
                        currentRole={u.role}
                        userId={u._id}
                        currentUserId={currentUser?._id || ''}
                        onRoleChanged={handleRoleChanged}
                      />
                    </td>

                    {/* Status */}
                    <td className="table-cell">
                      <span className={clsx(
                        'text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1.5',
                        u.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-500 dark:text-red-400'
                      )}>
                        {u.isActive ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                        )}
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Saved */}
                    <td className="table-cell text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {u.savedOpportunities?.length || 0}
                    </td>

                    {/* Joined */}
                    <td className="table-cell text-gray-500 dark:text-gray-400 text-xs">
                      {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                    </td>

                    {/* Actions */}
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover/row:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all"
                          title="Edit user"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggle(u._id)}
                          className={clsx('p-1.5 rounded-lg transition-all',
                            u.isActive
                              ? 'text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                              : 'text-gray-500 dark:text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                          )}
                          title={u.isActive ? 'Disable user' : 'Enable user'}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteId(u._id)}
                          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
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

      {/* ═══════ DELETE MODAL ═══════ */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            This will <span className="font-semibold text-red-500">permanently delete</span> the user account and all associated data. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete User</button>
        </div>
      </Modal>

      {/* ═══════ EDIT USER MODAL ═══════ */}
      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSaved={handleUserSaved}
        currentUserId={currentUser?._id || ''}
      />
    </AdminLayout>
  );
}
