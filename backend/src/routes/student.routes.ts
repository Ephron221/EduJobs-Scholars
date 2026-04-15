import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  getStudentStats,
} from '../controllers/student.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, adminOnly, getStudentStats);
router.get('/', protect, adminOnly, getStudents);
router.get('/:id', protect, adminOnly, getStudentById);
router.post('/', protect, adminOnly, createStudent);
router.put('/:id', protect, adminOnly, updateStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);
router.patch('/:id/toggle-status', protect, adminOnly, toggleStudentStatus);

export default router;
