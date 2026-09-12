import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationAPI } from '../api';
import { useAuth } from './AuthContext';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
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
      const list = Array.isArray(res.data?.notifications) ? res.data.notifications : (Array.isArray(res.data) ? res.data : []);
      setNotifications(list);
      const countRes = await notificationAPI.getUnreadCount();
      setUnreadCount(countRes.data?.count || 0);
    } catch { /* silent */ }
  };

  const markRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
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
