import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Users, Search, GraduationCap, CheckCircle, Ban, Eye, FileText, Activity } from 'lucide-react';
import { studentAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationNumber: string;
  trackingCode?: string;
  password?: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  address: string;
  level: string;
  institution: string;
  admissionDate: string;
  status: 'active' | 'pending' | 'suspended' | 'graduated';
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  registrationNumber: '',
  trackingCode: '',
  password: '',
  dateOfBirth: '',
  gender: 'Male',
  nationalId: '',
  address: '',
  level: 'Level 1',
  institution: '',
  admissionDate: '',
  status: 'pending' as 'active' | 'pending' | 'suspended' | 'graduated',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
};

export default function StudentRecords() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0, graduated: 0 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<Student | null>(null);
  const [editItem, setEditItem] = useState<Student | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        studentAPI.getAll({ search, status: filterStatus || undefined, level: filterLevel || undefined, page, limit: 15 }),
        studentAPI.getStats()
      ]);
      setStudents(res.data.students);
      setTotal(res.data.total);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load students');
    }
    setLoading(false);
  }, [search, filterStatus, filterLevel, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setModalOpen(true); };
  
  const openEdit = (s: Student) => {
    setForm({
      ...s,
      trackingCode: s.trackingCode || '',
      password: s.password || '', // Display existing password/PIN if available
      dateOfBirth: s.dateOfBirth.split('T')[0],
      admissionDate: s.admissionDate.split('T')[0],
    });
    setEditItem(s);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = form; // Don't send empty password on update
        await studentAPI.update(editItem._id, updateData);
        toast.success('Student updated!');
      } else {
        await studentAPI.create(form);
        toast.success('Student created!');
      }
      setModalOpen(false);
      fetchStudents();
    } catch {
      toast.error('Failed to save student');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await studentAPI.delete(id);
      toast.success('Student deleted');
      setDeleteId(null);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await studentAPI.toggleStatus(id);
      toast.success('Status toggled');
      fetchStudents();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <AdminLayout title="Student Records">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Total</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p></div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Users className="text-cyan-500" size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-green-500">{stats.active}</p></div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="text-green-500" size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Pending</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><Activity className="text-yellow-500" size={20} /></div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Suspended</p><p className="text-2xl font-bold text-red-500">{stats.suspended}</p></div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Ban className="text-red-500" size={20} /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-between mb-6">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name/reg no..." className="input-field pl-9 py-2.5" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="select-field w-36">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
          </select>
          <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }} className="select-field w-36">
            <option value="">All Levels</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="Level 5">Level 5</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 whitespace-nowrap">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Table */}
      {loading ? <Loader /> : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                <tr>
                  <th className="table-header">Student / Reg No</th>
                  <th className="table-header">Institution & Level</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-gray-500 dark:text-gray-400">No students found</td></tr>
                ) : students.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors border-b border-transparent last:border-0">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-xs shrink-0">
                          {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.firstName} {s.lastName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono tracking-wide">{s.registrationNumber}</p>
                            {(s.trackingCode || s.password) && (
                              <span className="text-[10px] bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-400 px-1.5 py-0.5 rounded font-mono border border-cyan-200 dark:border-cyan-800 border-dashed">
                                PTR: {s.trackingCode || s.password}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-900 dark:text-white font-medium flex items-center gap-1.5"><GraduationCap size={12} className="text-cyan-500"/> {s.institution}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.level}</p>
                    </td>
                    <td className="table-cell">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{s.phoneNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-40">{s.email}</p>
                    </td>
                    <td className="table-cell"><StatusBadge status={s.status} /></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleStatus(s._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title={s.status === 'active' ? 'Suspend' : 'Activate'}>
                          {s.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button onClick={() => setViewModal(s)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"><Eye size={14} /></button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {Math.ceil(total / 15) > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-white/5">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">← Prev</button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {Math.ceil(total / 15)}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(total / 15)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Student Profile" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-2xl shadow-lg">
                {viewModal.firstName.charAt(0)}{viewModal.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{viewModal.firstName} {viewModal.lastName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">{viewModal.registrationNumber}</span>
                  <StatusBadge status={viewModal.status} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2 mb-3"><Users size={14} className="text-cyan-500"/> Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Gender</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.gender}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">DOB</span><span className="text-sm font-medium text-gray-900 dark:text-white">{format(new Date(viewModal.dateOfBirth), 'MMM dd, yyyy')}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">National ID</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.nationalId}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Address</span><span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{viewModal.address}</span></div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tracking Code / PIN</span>
                    {(viewModal.trackingCode || viewModal.password) ? (
                      <span className="text-sm font-mono bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 px-2 rounded font-bold border border-cyan-200 dark:border-cyan-800 border-dashed">{viewModal.trackingCode || viewModal.password}</span>
                    ) : (
                      <span className="text-sm font-mono text-gray-400 italic">Unset</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2 mb-3"><GraduationCap size={14} className="text-cyan-500"/> Academic Detail</h4>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Institution</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.institution}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Level</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.level}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Admission</span><span className="text-sm font-medium text-gray-900 dark:text-white">{format(new Date(viewModal.admissionDate), 'MMM dd, yyyy')}</span></div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2 mb-3"><Activity size={14} className="text-cyan-500"/> Contact Info</h4>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Email</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.email}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-gray-500">Phone</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.phoneNumber}</span></div>
                </div>
              </div>

              {/* Guardian Info */}
              {viewModal.guardianName && (
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2 mb-3"><FileText size={14} className="text-cyan-500"/> Guardian Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Name</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.guardianName}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-gray-500">Phone</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.guardianPhone}</span></div>
                    {viewModal.guardianEmail && <div className="flex justify-between"><span className="text-sm text-gray-500">Email</span><span className="text-sm font-medium text-gray-900 dark:text-white">{viewModal.guardianEmail}</span></div>}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-end">
              <button onClick={() => setViewModal(null)} className="btn-secondary">Close Profile</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Student' : 'Add New Student'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          
          {/* Section 1 */}
          <div>
            <h4 className="text-sm font-bold text-cyan-500 mb-3 uppercase tracking-wider">Academics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Registration No. *</label>
                <input type="text" value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} className="input-field py-2 flex-1" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Institution *</label>
                <input type="text" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} className="input-field py-2" required placeholder="e.g. UR, RP" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Level *</label>
                <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="select-field py-2">
                  {[1,2,3,4,5,6].map(l => <option key={l} value={`Level ${l}`}>Level {l}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Date *</label>
                <input type="date" value={form.admissionDate} onChange={e => setForm({...form, admissionDate: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="select-field py-2">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="graduated">Graduated</option>
                </select></div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Section 2 */}
          <div>
            <h4 className="text-sm font-bold text-cyan-500 mb-3 uppercase tracking-wider">Personal Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                <input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                <input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth *</label>
                <input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="select-field py-2">
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">National ID / Passport *</label>
                <input type="text" value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} className="input-field py-2" required /></div>
              <div className="md:col-span-2"><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field py-2" required /></div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Section 3 */}
          <div>
            <h4 className="text-sm font-bold text-cyan-500 mb-3 uppercase tracking-wider">Account & Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input type="tel" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} className="input-field py-2" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Code (Optional)</label>
                <input type="text" value={form.trackingCode} onChange={e => setForm({...form, trackingCode: e.target.value})} className="input-field py-2" placeholder="e.g. TRK-2025" /></div>
              {!editItem && (
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field py-2" required={!editItem} minLength={6} /></div>
              )}
            </div>
          </div>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Section 4 */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Guardian (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={form.guardianName} onChange={e => setForm({...form, guardianName: e.target.value})} className="input-field py-2" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input type="tel" value={form.guardianPhone} onChange={e => setForm({...form, guardianPhone: e.target.value})} className="input-field py-2" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={form.guardianEmail} onChange={e => setForm({...form, guardianEmail: e.target.value})} className="input-field py-2" /></div>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-white/10" />

          {/* Section 5 */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Documents (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">National ID / Passport</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Diploma / Certificate</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Photo</label>
                <input type="file" accept=".jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Other Documents</label>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" /></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">Note: File uploads will be processed and securely stored in the student's profile.</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 sticky bottom-0 bg-white dark:bg-gray-900 p-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-2">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : null}
              {editItem ? 'Save Updates' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Student" size="sm">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">Are you sure you want to delete this student record? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => handleDelete(deleteId!)} className="btn-danger flex-1 font-semibold">Delete</button>
        </div>
      </Modal>

    </AdminLayout>
  );
}
