import { Router } from 'express';
import {
  getNotifications, markAsRead, markAllAsRead,
  createAnnouncement, deleteNotification, getUnreadCount,
  getAdminNotifications, updateNotification, getNotificationStats
} from '../controllers/notification.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);

// Admin Routes
router.post('/announcement', protect, adminOnly, createAnnouncement);
router.get('/admin', protect, adminOnly, getAdminNotifications);
router.get('/stats', protect, adminOnly, getNotificationStats);
router.put('/:id', protect, adminOnly, updateNotification);
router.delete('/:id', protect, adminOnly, deleteNotification);

export default router;
