import { Router } from 'express';
import {
  getNotifications, markAsRead, markAllAsRead,
  createAnnouncement, deleteNotification, getUnreadCount
} from '../controllers/notification.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);
router.post('/announcement', protect, adminOnly, createAnnouncement);
router.delete('/:id', protect, adminOnly, deleteNotification);

export default router;
