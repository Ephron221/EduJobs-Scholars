import { Router } from 'express';
import {
  getApplications, getApplicationById, getApplicationsByStudent,
  createApplication, updateApplication, deleteApplication
} from '../controllers/application.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getApplications);
router.get('/student/:studentId', protect, getApplicationsByStudent);
router.get('/:id', protect, getApplicationById);
router.post('/', protect, adminOnly, createApplication);
router.put('/:id', protect, adminOnly, updateApplication);
router.delete('/:id', protect, adminOnly, deleteApplication);

export default router;
