import { Router } from 'express';
import {
  getUniversities, getUniversityById, createUniversity,
  updateUniversity, deleteUniversity, uploadUniversityFiles, deleteUniversityFile
} from '../controllers/university.controller';
import { protect, adminOnly, staffOnly } from '../middleware/auth';
import { uploadMixed } from '../middleware/upload';

const router = Router();

router.get('/', getUniversities);
router.get('/:id', getUniversityById);

// Protected routes
router.use(protect);

router.post('/', staffOnly, createUniversity);
router.put('/:id', staffOnly, updateUniversity);
router.post('/:id/upload', staffOnly, uploadMixed.array('files', 10), uploadUniversityFiles);
router.delete('/:id/files', staffOnly, deleteUniversityFile);

// Admin only
router.delete('/:id', adminOnly, deleteUniversity);

export default router;
