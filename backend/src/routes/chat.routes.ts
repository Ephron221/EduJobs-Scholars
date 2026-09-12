import express from 'express';
import {
  getChatUsers,
  getConversation,
  sendMessage,
  pingActive,
  logoutActive,
  deleteMessage,
  getPendingDeletions,
  approveDeletion,
  getAdminAllMessages,
} from '../controllers/chat.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All chat routes require authentication

router.put('/ping', pingActive);
router.put('/logout', logoutActive);
router.get('/pending-deletions', adminOnly, getPendingDeletions);
router.get('/all-messages', adminOnly, getAdminAllMessages);
router.get('/users', getChatUsers);
router.get('/:userId', getConversation);
router.post('/:userId', sendMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/approve-delete', adminOnly, approveDeletion);

export default router;
