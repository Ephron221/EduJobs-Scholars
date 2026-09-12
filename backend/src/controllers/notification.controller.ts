import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role || 'student';
    const notifications = await Notification.find({
      $or: [
        { userId },
        { isGlobal: true, targetRole: { $in: ['all', userRole, null] } },
        { isGlobal: true, targetRole: { $exists: false } }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    const notificationsWithReadStatus = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.isGlobal
        ? n.readBy.some((id) => id.toString() === userId?.toString())
        : n.isRead,
    }));
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ notifications: notificationsWithReadStatus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notifications', error });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role || 'student';
    const count = await Notification.countDocuments({
      $or: [
        { userId, isRead: false },
        {
          isGlobal: true,
          targetRole: { $in: ['all', userRole, null] },
          readBy: { $ne: userId }
        }
      ]
    });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get unread count', error });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
    if (!notification.isGlobal && notification.userId?.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    if (notification.isGlobal) {
      if (!notification.readBy.some((id) => id.toString() === userId?.toString())) {
        notification.readBy.push(userId as never);
        await notification.save();
      }
    } else {
      notification.isRead = true;
      await notification.save();
    }
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification', error });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    await Notification.updateMany(
      { isGlobal: true, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId as mongoose.Types.ObjectId } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read', error });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type, userId, targetRole, link } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type: type || 'announcement',
      isGlobal: !userId,
      userId: userId || null,
      targetRole: targetRole || 'all',
      link: link || '',
    });
    res.status(201).json({ message: 'Announcement sent', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement', error });
  }
};

export const getAdminNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};

    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(query),
    ]);

    res.json({ notifications, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get admin notifications', error });
  }
};

export const updateNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, message, type },
      { new: true, runValidators: true }
    );
    if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
    res.json({ message: 'Notification updated successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification', error });
  }
};

export const getNotificationStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [total, announcement, new_opportunity, deadline, system] = await Promise.all([
      Notification.countDocuments({ isGlobal: true }),
      Notification.countDocuments({ type: 'announcement', isGlobal: true }),
      Notification.countDocuments({ type: 'new_opportunity', isGlobal: true }),
      Notification.countDocuments({ type: 'deadline', isGlobal: true }),
      Notification.countDocuments({ type: 'system', isGlobal: true }),
    ]);
    res.json({ total, announcement, new_opportunity, deadline, system });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notification stats', error });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error });
  }
};
