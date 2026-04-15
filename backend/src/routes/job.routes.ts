import { Router } from 'express';
import {
  getJobs, getJobById, createJob, updateJob, deleteJob, uploadJobFiles, deleteJobFile
} from '../controllers/job.controller';
import { protect, adminOnly } from '../middleware/auth';
import { uploadMixed } from '../middleware/upload';

const router = Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);

// File upload routes
router.post('/:id/upload', protect, adminOnly, uploadMixed.array('files', 10), uploadJobFiles);
router.delete('/:id/files', protect, adminOnly, deleteJobFile);

export default router;
