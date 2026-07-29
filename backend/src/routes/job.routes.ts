import { Router } from 'express';
import {
  getJobs, getJobById, createJob, updateJob, deleteJob, uploadJobFiles, deleteJobFile
} from '../controllers/job.controller';
import { protect, adminOnly, staffOnly } from '../middleware/auth';
import { uploadMixed } from '../middleware/upload';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(protect);

router.post('/', staffOnly, createJob);
router.put('/:id', staffOnly, updateJob);
router.post('/:id/upload', staffOnly, uploadMixed.array('files', 10), uploadJobFiles);
router.delete('/:id/files', staffOnly, deleteJobFile);

// Admin only
router.delete('/:id', adminOnly, deleteJob);

export default router;
