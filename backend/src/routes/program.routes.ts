import { Router } from 'express';
import {
  getPrograms, getProgramById, getProgramsByUniversity,
  createProgram, updateProgram, deleteProgram
} from '../controllers/program.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getPrograms);
router.get('/university/:universityId', getProgramsByUniversity);
router.get('/:id', getProgramById);
router.post('/', protect, adminOnly, createProgram);
router.put('/:id', protect, adminOnly, updateProgram);
router.delete('/:id', protect, adminOnly, deleteProgram);

export default router;
