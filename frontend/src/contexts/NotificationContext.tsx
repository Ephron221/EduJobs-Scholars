import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationAPI } from '../api';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications);
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data.count);
    } catch { /* silent */ }
  };

  const markRead = async (id: string) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
