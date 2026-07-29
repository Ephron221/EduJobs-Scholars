import { Router } from 'express';
import {
  getApplications, getApplicationById, getApplicationsByStudent,
  createApplication, createPublicApplication, updateApplication, deleteApplication,
  resolveApplication
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
router.put('/:id', protect, adminOnly, updateApplication);
router.patch('/:id/resolve', protect, resolveApplication); // Admin or Assigned Assistant
router.delete('/:id', protect, adminOnly, deleteApplication);

export default router;
