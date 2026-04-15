import { useState, useEffect, useCallback } from 'react';
import { Search, Users, UserCheck, UserX, Trash2, Shield } from 'lucide-react';
import { userAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import clsx from 'clsx';

interface User { _id: string; name: string; email: string; role: string; isActive: boolean; savedOpportunities: unknown[]; createdAt: string; }

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ search, role: filterRole || undefined, limit: 100 });
      setUsers(res.data.users);
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filterRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (id: string) => {
    try {
      const res = await userAPI.toggleStatus(id);
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    try { await userAPI.delete(id); toast.success('User deleted'); setDeleteId(null); fetchUsers(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout title="Manage Users">
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="select-field w-36">
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="jobseeker">Jobseeker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users size={15} /> <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span> users
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
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
                  <tr><td colSpan={6} className="py-16 text-center text-gray-500 dark:text-gray-400">No users found</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                          u.role === 'admin' ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black' :
                          u.role === 'jobseeker' ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white' :
                          'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-700 dark:text-gray-300')}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit capitalize',
                        u.role === 'admin' ? 'bg-cyan-500/20 text-cyan-300' :
                        u.role === 'jobseeker' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-gray-200/50 dark:bg-gray-700 text-gray-600 dark:text-gray-300')}>
                        {u.role === 'admin' && <Shield size={10} />} {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', u.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')}>
                        {u.isActive ? '● Active' : '○ Disabled'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600 dark:text-gray-400 text-sm">{u.savedOpportunities?.length || 0}</td>
                    <td className="table-cell text-gray-500 dark:text-gray-400 text-xs">{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleToggle(u._id)}
                          className={clsx('p-1.5 rounded-lg transition-all', u.isActive ? 'text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 dark:text-gray-400 hover:text-green-400 hover:bg-green-500/10')}>
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button onClick={() => setDeleteId(u._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
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

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">This will permanently delete the user account and all associated data.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete User</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
