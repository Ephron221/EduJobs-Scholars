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
  sendStudentDecision,
} from '../controllers/student.controller';
import { protect, adminOnly, staffOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, staffOnly, getStudentStats);
router.get('/', protect, staffOnly, getStudents);
router.get('/:id', protect, staffOnly, getStudentById);
router.post('/', protect, staffOnly, createStudent);
router.put('/:id', protect, staffOnly, updateStudent);
router.post('/:id/upload', protect, staffOnly, uploadMixed.array('files', 10), uploadStudentFiles);
router.delete('/:id/files', protect, staffOnly, deleteStudentFile);
router.patch('/:id/files', protect, staffOnly, renameStudentFile);
router.post('/:id/send-decision', protect, staffOnly, sendStudentDecision);

// Only Admin can delete or toggle status (destructive/critical actions)
router.delete('/:id', protect, adminOnly, deleteStudent);
router.patch('/:id/toggle-status', protect, adminOnly, toggleStudentStatus);

export default router;
