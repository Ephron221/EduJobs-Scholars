import { Router } from 'express';
import {
  getUsers, getUserById, updateUser, deleteUser,
  toggleUserStatus, saveOpportunity, unsaveOpportunity, getSavedOpportunities,
  getUserStats, updateUserRole, getPublicAssistants
} from '../controllers/user.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/assistants', getPublicAssistants);
router.get('/', protect, adminOnly, getUsers);
router.get('/stats', protect, adminOnly, getUserStats);
router.get('/saved', protect, getSavedOpportunities);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.patch('/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.patch('/:id/role', protect, adminOnly, updateUserRole);
router.post('/save-opportunity', protect, saveOpportunity);
router.delete('/unsave-opportunity/:oppId', protect, unsaveOpportunity);

export default router;
