import api from './axios';

export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: 'student' | 'jobseeker' }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: FormData | { name: string; email: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

export const universityAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/universities', { params }),
  getById: (id: string) => api.get(`/universities/${id}`),
  create: (data: unknown) => api.post('/universities', data),
  update: (id: string, data: unknown) => api.put(`/universities/${id}`, data),
  delete: (id: string) => api.delete(`/universities/${id}`),
  uploadFiles: (id: string, formData: FormData) =>
    api.post(`/universities/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile: (id: string, fileUrl: string, type: 'image' | 'document') =>
    api.delete(`/universities/${id}/files`, { data: { fileUrl, type } }),
};

export const programAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/programs', { params }),
  getByUniversity: (universityId: string) => api.get(`/programs/university/${universityId}`),
  getById: (id: string) => api.get(`/programs/${id}`),
  create: (data: unknown) => api.post('/programs', data),
  update: (id: string, data: unknown) => api.put(`/programs/${id}`, data),
  delete: (id: string) => api.delete(`/programs/${id}`),
};

export const jobAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/jobs', { params }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  create: (data: unknown) => api.post('/jobs', data),
  update: (id: string, data: unknown) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  uploadFiles: (id: string, formData: FormData) =>
    api.post(`/jobs/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile: (id: string, fileUrl: string, type: 'image' | 'document') =>
    api.delete(`/jobs/${id}/files`, { data: { fileUrl, type } }),
};

export const applicationAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/applications', { params }),
  getByStudent: (studentId: string) => api.get(`/applications/student/${studentId}`),
  getById: (id: string) => api.get(`/applications/${id}`),
  create: (data: unknown) => api.post('/applications', data),
  createPublic: (data: unknown) => api.post('/applications/public', data),
  update: (id: string, data: unknown) => api.put(`/applications/${id}`, data),
  resolve: (id: string, resolutionProof: string) => api.patch(`/applications/${id}/resolve`, { resolutionProof }),
  requestDeletion: (id: string, reason: string) => api.patch(`/applications/${id}/request-deletion`, { reason }),
  rejectDeletion: (id: string) => api.patch(`/applications/${id}/reject-deletion`),
  delete: (id: string) => api.delete(`/applications/${id}`),
};

export const userAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getStats: () => api.get('/users/stats'),
  getAssistants: () => api.get('/users/assistants'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  saveOpportunity: (data: { id: string; type: string }) => api.post('/users/save-opportunity', data),
  unsaveOpportunity: (oppId: string) => api.delete(`/users/unsave-opportunity/${oppId}`),
  getSaved: () => api.get('/users/saved'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getAdminAll: (params?: Record<string, unknown>) => api.get('/notifications/admin', { params }),
  getStats: () => api.get('/notifications/stats'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read'),
  createAnnouncement: (data: unknown) => api.post('/notifications/announcement', data),
  update: (id: string, data: unknown) => api.put(`/notifications/${id}`, data),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const guidanceAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/guidance', { params }),
  getStats: () => api.get('/guidance/stats'),
  getById: (id: string) => api.get(`/guidance/${id}`),
  create: (data: unknown) => api.post('/guidance', data),
  update: (id: string, data: unknown) => api.put(`/guidance/${id}`, data),
  delete: (id: string) => api.delete(`/guidance/${id}`),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getActivity: () => api.get('/stats/activity'),
};

export const studentAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/students', { params }),
  getStats: () => api.get('/students/stats'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: unknown) => api.post('/students', data),
  update: (id: string, data: unknown) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  toggleStatus: (id: string) => api.patch(`/students/${id}/toggle-status`),
  uploadFiles: (id: string, formData: FormData) =>
    api.post(`/students/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile: (id: string, fileUrl: string) =>
    api.delete(`/students/${id}/files`, { data: { fileUrl } }),
  renameFile: (id: string, fileUrl: string, name: string) =>
    api.patch(`/students/${id}/files`, { fileUrl, name }),
};

export const contactAPI = {
  create: (data: unknown) => api.post('/contact', data),
  getAll: (params?: Record<string, unknown>) => api.get('/contact', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/contact/${id}`, { status }),
  delete: (id: string) => api.delete(`/contact/${id}`),
};

export const serviceAPI = {
  getAll: () => api.get('/services'),
  create: (data: unknown) => api.post('/services', data),
  update: (id: string, data: unknown) => api.put(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const heroImageAPI = {
  getAll: () => api.get('/hero-images'),
  create: (data: unknown) => api.post('/hero-images', data),
  update: (id: string, data: unknown) => api.put(`/hero-images/${id}`, data),
  delete: (id: string) => api.delete(`/hero-images/${id}`),
};

export const successStoryAPI = {
  getAll: () => api.get('/success-stories'),
  create: (data: unknown) => api.post('/success-stories', data),
  update: (id: string, data: unknown) => api.put(`/success-stories/${id}`, data),
  delete: (id: string) => api.delete(`/success-stories/${id}`),
};

export const chatAPI = {
  getUsers: () => api.get('/chat/users'),
  getConversation: (userId: string) => api.get(`/chat/${userId}`),
  sendMessage: (userId: string, content: string) => api.post(`/chat/${userId}`, { content }),
  deleteMessage: (id: string) => api.delete(`/chat/${id}`),
  getAllMessages: (params?: Record<string, unknown>) => api.get('/chat/all-messages', { params }),
  getPendingDeletions: () => api.get('/chat/pending-deletions'),
  approveDeletion: (id: string, approve: boolean) => api.post(`/chat/${id}/approve-delete`, { approve }),
  ping: () => api.put('/chat/ping'),
  logout: () => api.put('/chat/logout'),
};
