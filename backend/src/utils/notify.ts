import Notification from '../models/Notification';
import mongoose from 'mongoose';

interface NotificationParams {
  title: string;
  message: string;
  type?: 'deadline' | 'new_opportunity' | 'status_update' | 'announcement' | 'system';
  userId?: string | mongoose.Types.ObjectId | null;
  targetRole?: 'admin' | 'assistant' | 'student' | 'all';
  link?: string;
  isGlobal?: boolean;
}

export const createSystemNotification = async ({
  title,
  message,
  type = 'system',
  userId = null,
  targetRole = 'all',
  link = '',
  isGlobal,
}: NotificationParams) => {
  try {
    const globalFlag = isGlobal !== undefined ? isGlobal : !userId;
    const notification = await Notification.create({
      title,
      message,
      type,
      userId: userId || null,
      isGlobal: globalFlag,
      targetRole,
      link: link || '',
    });
    return notification;
  } catch (error) {
    console.error('Failed to create system notification:', error);
    return null;
  }
};
