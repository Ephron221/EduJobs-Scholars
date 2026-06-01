import { Router } from 'express';
import { uploadMixed } from '../middleware/upload';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  getStudentStats,
  uploadStudentFiles,
  deleteStudentFile,
  renameStudentFile,
} from '../controllers/student.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, adminOnly, getStudentStats);
router.get('/', protect, adminOnly, getStudents);
router.get('/:id', protect, adminOnly, getStudentById);
router.post('/', protect, adminOnly, createStudent);
router.put('/:id', protect, adminOnly, updateStudent);
router.post('/:id/upload', protect, adminOnly, uploadMixed.array('files', 10), uploadStudentFiles);
router.delete('/:id/files', protect, adminOnly, deleteStudentFile);
router.patch('/:id/files', protect, adminOnly, renameStudentFile);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.patch('/:id/toggle-status', protect, adminOnly, toggleStudentStatus);

export default router;
