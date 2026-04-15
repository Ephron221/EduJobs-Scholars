import { Router } from 'express';
import {
  getUniversities, getUniversityById, createUniversity,
  updateUniversity, deleteUniversity, uploadUniversityFiles, deleteUniversityFile
} from '../controllers/university.controller';
import { protect, adminOnly } from '../middleware/auth';
import { uploadMixed } from '../middleware/upload';

const router = Router();

router.get('/', getUniversities);
router.get('/:id', getUniversityById);
router.post('/', protect, adminOnly, createUniversity);
router.put('/:id', protect, adminOnly, updateUniversity);
router.delete('/:id', protect, adminOnly, deleteUniversity);

// File upload routes
router.post('/:id/upload', protect, adminOnly, uploadMixed.array('files', 10), uploadUniversityFiles);
router.delete('/:id/files', protect, adminOnly, deleteUniversityFile);

export default router;
