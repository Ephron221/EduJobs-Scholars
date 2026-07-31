import { Router } from 'express';
import {
  getApplications, getApplicationById, getApplicationsByStudent,
  createApplication, createPublicApplication, updateApplication, deleteApplication,
  resolveApplication, requestDeletion, rejectDeletion
} from '../controllers/application.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

// Public route for creating requests
router.post('/public', createPublicApplication);

// Protected routes
router.get('/', protect, getApplications); // Protect but allow both Admin and Assistant (controller handles filtering)
router.get('/student/:studentId', protect, getApplicationsByStudent);
router.get('/:id', protect, getApplicationById);
router.post('/', protect, adminOnly, createApplication);
router.put('/:id', protect, updateApplication); // Admin or Assigned Assistant (controller handles auth)
router.patch('/:id/resolve', protect, resolveApplication); // Admin or Assigned Assistant
router.patch('/:id/request-deletion', protect, requestDeletion); // Assigned Assistant
router.patch('/:id/reject-deletion', protect, adminOnly, rejectDeletion); // Admin only
router.delete('/:id', protect, adminOnly, deleteApplication);

export default router;
