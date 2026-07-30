import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Pencil, Trash2, Users, Search, GraduationCap, CheckCircle, Ban, Eye, FileText, Activity, Download, UploadCloud, ArrowUpRight } from 'lucide-react';
import { studentAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getAssetUrl } from '../../utils/assetUrl';
import clsx from 'clsx';

interface StudentDocument {
  name: string;
  url: string;
  category: 'nationalId' | 'passportPhoto' | 'diploma' | 'other';
  uploadedAt: string;
}

interface UploadRow {
  id: string;
  category: 'nationalId' | 'passportPhoto' | 'diploma' | 'other';
  file?: File;
  customName: string;
}

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
  documents?: StudentDocument[];
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<'nationalId' | 'passportPhoto' | 'diploma' | 'other', string> = {
  nationalId: 'National ID / Passport',
  passportPhoto: 'Passport Photo',
  diploma: 'Diploma / Certificate',
  other: 'Other Documents',
};

const getExistingDocNames = (student: Student | null, category: string): string => {
  if (!student?.documents) return '';
  const docs = student.documents.filter((d) => (d as any).category === category);
  return docs.map((d) => (d as any).name || '').filter(Boolean).join(', ');
};

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
  const { isAdmin } = useAuth();
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
  const [documentFiles, setDocumentFiles] = useState<{
    nationalId?: File;
    passportPhoto?: File;
    diploma?: File;
    other?: File[];
  }>({});
  const [fileReplaceTarget, setFileReplaceTarget] = useState<{
    studentId: string;
    oldUrl: string;
    category: 'nationalId' | 'passportPhoto' | 'diploma' | 'other';
  } | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<StudentDocument | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ studentId: string; fileUrl: string; name: string } | null>(null);
  const [newDocRows, setNewDocRows] = useState<UploadRow[]>([{ id: 'row-1', category: 'other', customName: '' }]);
  const [fileActionLoading, setFileActionLoading] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!selectedPreview) {
      setPreviewBlobUrl(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;
    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const assetUrl = getAssetUrl(selectedPreview.url);
        if (!assetUrl) throw new Error('Invalid URL');
        
        const response = await fetch(assetUrl);
        if (!response.ok) throw new Error('Unable to load preview');
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPreviewBlobUrl(objectUrl);
      } catch (error) {
        if (!cancelled) setPreviewError((error as Error).message || 'Preview failed');
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    loadPreview();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedPreview]);

  const normalizeDocuments = (documents: (StudentDocument | string)[] = []): StudentDocument[] =>
    documents.map((doc) => typeof doc === 'string'
      ? {
          name: doc.split('/').pop() || 'Document',
          url: doc,
          category: 'other',
          uploadedAt: '',
        }
      : doc
    );

  const refreshStudent = async (studentId: string) => {
    try {
      const res = await studentAPI.getById(studentId);
      setViewModal(res.data.student);
      fetchStudents();
    } catch {
      toast.error('Failed to refresh student documents');
    }
  };

  const getDocumentExtension = (doc: StudentDocument) => {
    const source = `${doc.name || ''} ${doc.url || ''}`.split('?')[0];
    return source.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || '';
  };
  const isPreviewableImage = (doc: StudentDocument) => ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(getDocumentExtension(doc));
  const isPreviewablePdf = (doc: StudentDocument) => getDocumentExtension(doc) === 'pdf';

  const selectPreview = (doc: StudentDocument) => {
    setSelectedPreview(doc);
    setRenameTarget({ studentId: viewModal?._id || '', fileUrl: doc.url, name: doc.name });
    window.setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const openFileInNewTab = (url: string) => {
    const assetUrl = getAssetUrl(url);
    if (assetUrl) window.open(assetUrl, '_blank', 'noopener,noreferrer');
  };

  const updateDocumentName = async () => {
    if (!renameTarget || !viewModal) return;
    setFileActionLoading(true);
    try {
      await studentAPI.renameFile(renameTarget.studentId, renameTarget.fileUrl, renameTarget.name);
      await refreshStudent(renameTarget.studentId);
      setSelectedPreview((prev) => prev ? { ...prev, name: renameTarget.name } : prev);
      toast.success('Document name updated successfully');
    } catch {
      toast.error('Failed to update file name');
    }
    setFileActionLoading(false);
  };

  const uploadDocumentFiles = async (studentId: string) => {
    if (documentFiles.nationalId) {
      const formData = new FormData();
      formData.append('files', documentFiles.nationalId);
      formData.append('category', 'nationalId');
      formData.append('names', documentFiles.nationalId.name);
      await studentAPI.uploadFiles(studentId, formData);
    }
    if (documentFiles.passportPhoto) {
      const formData = new FormData();
      formData.append('files', documentFiles.passportPhoto);
      formData.append('category', 'passportPhoto');
      formData.append('names', documentFiles.passportPhoto.name);
      await studentAPI.uploadFiles(studentId, formData);
    }
    if (documentFiles.diploma) {
      const formData = new FormData();
      formData.append('files', documentFiles.diploma);
      formData.append('category', 'diploma');
      formData.append('names', documentFiles.diploma.name);
      await studentAPI.uploadFiles(studentId, formData);
    }
    if (documentFiles.other?.length) {
      const formData = new FormData();
      documentFiles.other.forEach((file) => formData.append('files', file));
      formData.append('category', 'other');
      documentFiles.other.forEach((file) => formData.append('names', file.name));
      await studentAPI.uploadFiles(studentId, formData);
    }

    for (const row of newDocRows) {
      if (!row.file) continue;
      const formData = new FormData();
      formData.append('files', row.file);
      formData.append('category', row.category);
      formData.append('names', row.customName.trim() || row.file.name);
      await studentAPI.uploadFiles(studentId, formData);
    }
  };

  const addUploadRow = () => {
    setNewDocRows((prev) => [...prev, { id: `row-${Date.now()}`, category: 'other', customName: '' }]);
  };

  const updateUploadRow = (id: string, updates: Partial<UploadRow>) => {
    setNewDocRows((prev) => prev.map((row) => row.id === id ? { ...row, ...updates } : row));
  };

  const removeUploadRow = (id: string) => {
    setNewDocRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleDeleteFile = async (studentId: string, fileUrl: string) => {
    if (!window.confirm('Delete this file from the student profile?')) return;
    setFileActionLoading(true);
    try {
      await studentAPI.deleteFile(studentId, fileUrl);
      await refreshStudent(studentId);
      toast.success('File deleted successfully');
    } catch {
      toast.error('Failed to delete file');
    }
    setFileActionLoading(false);
  };

  const openReplaceFile = (studentId: string, oldUrl: string, category: 'nationalId' | 'passportPhoto' | 'diploma' | 'other') => {
    setFileReplaceTarget({ studentId, oldUrl, category });
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fileReplaceTarget) return;
    setFileActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('category', fileReplaceTarget.category);
      await studentAPI.uploadFiles(fileReplaceTarget.studentId, formData);
      await studentAPI.deleteFile(fileReplaceTarget.studentId, fileReplaceTarget.oldUrl);
      await refreshStudent(fileReplaceTarget.studentId);
      toast.success('File replaced successfully');
    } catch {
      toast.error('Failed to replace file');
    }
    setFileActionLoading(false);
    setFileReplaceTarget(null);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditItem(null);
    setDocumentFiles({});
    setModalOpen(true);
  };
  
  const openEdit = (s: Student) => {
    setForm({
      ...s,
      trackingCode: s.trackingCode || '',
      password: s.password || '', 
      dateOfBirth: s.dateOfBirth.split('T')[0],
      admissionDate: s.admissionDate.split('T')[0],
    });
    setEditItem(s);
    setDocumentFiles({});
    setModalOpen(true);
  };

  const openView = async (s: Student) => {
    try {
      const res = await studentAPI.getById(s._id);
      setViewModal(res.data.student);
      setSelectedPreview(null);
      setRenameTarget(null);
    } catch {
      toast.error('Failed to load student profile');
    }
  };

  const previewSrc = selectedPreview ? (previewBlobUrl || getAssetUrl(selectedPreview.url)) : '';
  const canPreviewSelectedImage = selectedPreview ? isPreviewableImage(selectedPreview) : false;
  const canPreviewSelectedPdf = selectedPreview ? isPreviewablePdf(selectedPreview) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let studentId: string | null = null;
      if (editItem) {
        const { password, ...updateData } = form; 
        await studentAPI.update(editItem._id, updateData);
        studentId = editItem._id;
        toast.success('Student updated!');
      } else {
        const res = await studentAPI.create(form);
        studentId = res.data.student?._id || null;
        toast.success('Student created!');
      }

      if (studentId) {
        await uploadDocumentFiles(studentId);
      }

      setModalOpen(false);
      setDocumentFiles({});
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save student');
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

  const viewDocuments = viewModal ? normalizeDocuments(viewModal.documents || []) : [];

  return (
    <AdminLayout title="Student Records">
      <input
        ref={replaceInputRef}
        type="file"
        hidden
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleReplaceFile}
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div
          onClick={() => { setFilterStatus(''); setPage(1); }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
            filterStatus === '' && "ring-2 ring-cyan-500 border-transparent bg-cyan-500/5"
          )}
        >
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Total</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p></div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Users className="text-cyan-500" size={20} /></div>
        </div>

        <div
          onClick={() => { setFilterStatus(filterStatus === 'active' ? '' : 'active'); setPage(1); }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
            filterStatus === 'active' && "ring-2 ring-green-500 border-transparent bg-green-500/5"
          )}
        >
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-green-500">{stats.active}</p></div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="text-green-500" size={20} /></div>
        </div>

        <div
          onClick={() => { setFilterStatus(filterStatus === 'pending' ? '' : 'pending'); setPage(1); }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
            filterStatus === 'pending' && "ring-2 ring-yellow-500 border-transparent bg-yellow-500/5"
          )}
        >
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Pending</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><Activity className="text-yellow-500" size={20} /></div>
        </div>

        <div
          onClick={() => { setFilterStatus(filterStatus === 'suspended' ? '' : 'suspended'); setPage(1); }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
            filterStatus === 'suspended' && "ring-2 ring-red-500 border-transparent bg-red-500/5"
          )}
        >
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Suspended</p><p className="text-2xl font-bold text-red-500">{stats.suspended}</p></div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Ban className="text-red-500" size={20} /></div>
        </div>

        <div
          onClick={() => { setFilterStatus(filterStatus === 'graduated' ? '' : 'graduated'); setPage(1); }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95",
            filterStatus === 'graduated' && "ring-2 ring-purple-500 border-transparent bg-purple-500/5"
          )}
        >
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Graduated</p><p className="text-2xl font-bold text-purple-500">{stats.graduated}</p></div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><GraduationCap className="text-purple-500" size={20} /></div>
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
                        <button onClick={() => openView(s)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-all"><Eye size={14} /></button>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Pencil size={14} /></button>
                        {isAdmin && (
                          <button onClick={() => setDeleteId(s._id)} className="p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={14} /></button>
                        )}
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

            <div className="space-y-4">
              <div className="space-y-4">
                {viewDocuments.length === 0 ? (
                  <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-950/70 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No uploaded student documents available.
                  </div>
                ) : (
                  (['nationalId', 'passportPhoto', 'diploma', 'other'] as const).map((category) => {
                    const docs = viewDocuments.filter((doc) => doc.category === category);
                    if (docs.length === 0) return null;
                    return (
                      <div key={category} className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-950/70 p-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{categoryLabels[category]}</h4>
                        <div className="space-y-3">
                          {docs.map((doc) => (
                            <div key={doc.url} className="rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : 'Uploaded'}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center justify-end">
                                <button type="button" title="Preview" onClick={() => selectPreview(doc)} className="btn-secondary btn-sm p-2 rounded-lg">
                                  <Eye size={16} />
                                </button>
                                <button type="button" title="Download" onClick={() => openFileInNewTab(doc.url)} className="btn-secondary btn-sm p-2 rounded-lg">
                                  <Download size={16} />
                                </button>
                                <button type="button" title="Replace" onClick={() => openReplaceFile(viewModal._id, doc.url, category)} disabled={fileActionLoading} className="btn-primary btn-sm p-2 rounded-lg">
                                  <UploadCloud size={16} />
                                </button>
                                {isAdmin && (
                                  <button type="button" title="Delete" onClick={() => handleDeleteFile(viewModal._id, doc.url)} disabled={fileActionLoading} className="btn-danger btn-sm p-2 rounded-lg">
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}

                {selectedPreview && (
                  <div ref={previewRef} className="rounded-3xl border border-cyan-200 dark:border-cyan-500/40 bg-white/80 dark:bg-gray-950/80 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Previewing: {selectedPreview.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Category: {categoryLabels[selectedPreview.category]}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <button type="button" onClick={() => setSelectedPreview(null)} className="btn-secondary btn-sm">Close Preview</button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-3 mb-4 min-h-[360px] overflow-hidden bg-gray-50 dark:bg-gray-900">
                      {previewLoading ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          <p>Loading preview...</p>
                        </div>
                      ) : previewError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          <p>{previewError}</p>
                          <div className="flex flex-wrap items-center gap-2 justify-center">
                            <button type="button" onClick={() => openFileInNewTab(selectedPreview.url)} className="btn-secondary btn-sm flex items-center gap-2">
                              <ArrowUpRight size={14} /> Open in new tab
                            </button>
                          </div>
                        </div>
                      ) : canPreviewSelectedImage ? (
                        <img src={previewSrc} alt={selectedPreview.name} className="w-full max-h-[520px] object-contain rounded-lg" />
                      ) : canPreviewSelectedPdf ? (
                        <iframe
                          key={previewSrc}
                          src={previewSrc}
                          title={selectedPreview.name}
                          className="w-full h-[70vh] min-h-[460px] rounded-lg bg-white"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-gray-500 dark:text-gray-400">
                          <p>This document cannot be previewed inline.</p>
                          <div className="flex flex-wrap items-center gap-2 justify-center">
                            <button type="button" onClick={() => openFileInNewTab(selectedPreview.url)} className="btn-secondary btn-sm flex items-center gap-2">
                              <ArrowUpRight size={14} /> Open in new tab
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">File Label</label>
                        <input
                          type="text"
                          value={renameTarget?.name || selectedPreview.name}
                          onChange={(e) => renameTarget && setRenameTarget({ ...renameTarget, name: e.target.value })}
                          className="input-field py-2 w-full"
                        />
                      </div>
                      <button type="button" onClick={updateDocumentName} disabled={fileActionLoading} className="btn-primary btn-sm h-11 self-end">Save Label</button>
                    </div>
                  </div>
                )}
              </div>
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
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
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
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentFiles({ ...documentFiles, nationalId: e.target.files?.[0] })} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-1">{documentFiles.nationalId?.name || getExistingDocNames(editItem, 'nationalId') || 'No file selected'}</p></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Diploma / Certificate</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentFiles({ ...documentFiles, diploma: e.target.files?.[0] })} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-1">{documentFiles.diploma?.name || getExistingDocNames(editItem, 'diploma') || 'No file selected'}</p></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Photo</label>
                <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => setDocumentFiles({ ...documentFiles, passportPhoto: e.target.files?.[0] })} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-1">{documentFiles.passportPhoto?.name || getExistingDocNames(editItem, 'passportPhoto') || 'No file selected'}</p></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Other Documents</label>
                <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setDocumentFiles({ ...documentFiles, other: Array.from(e.target.files || []) })} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-1">{documentFiles.other?.length ? `${documentFiles.other.length} file(s) selected` : getExistingDocNames(editItem, 'other') || 'No files selected'}</p></div>
            </div>
            <div className="mt-4 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-950/70 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Additional Documents</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upload extra files and set your own names.</p>
                </div>
                <button type="button" onClick={addUploadRow} className="btn-secondary btn-sm">Add file</button>
              </div>
              <div className="space-y-3">
                {newDocRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Document name</label>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">File</label>
                      <select value={row.category} onChange={(e) => updateUploadRow(row.id, { category: e.target.value as UploadRow['category'] })} className="select-field py-2">
                        <option value="nationalId">National ID / Passport</option>
                        <option value="passportPhoto">Passport Photo</option>
                        <option value="diploma">Diploma / Certificate</option>
                        <option value="other">Other Document</option>
                      </select>
                      <input type="text" value={row.customName} onChange={(e) => updateUploadRow(row.id, { customName: e.target.value })} className="input-field py-2" placeholder="Custom file label" />
                      <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => updateUploadRow(row.id, { file: e.target.files?.[0] })} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-gray-800 dark:file:text-cyan-400 dark:hover:file:bg-gray-700 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-400">{row.file?.name || 'No file selected'}</p>
                      <button type="button" onClick={() => removeUploadRow(row.id)} className="btn-danger btn-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
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
