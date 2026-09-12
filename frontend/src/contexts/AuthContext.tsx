import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, chatAPI } from '../api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'jobseeker' | 'assistant';
  avatar?: string;
  savedOpportunities: { id: string; type: 'university' | 'job' }[];
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, password: string, role?: 'student' | 'jobseeker') => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAdmin: boolean;
  isAssistant: boolean;
  isJobseeker: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser.role as string;
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'jobseeker' = 'student') => {
    const res = await authAPI.register({ name, email, password, role });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Heartbeat ping while user is logged in
  useEffect(() => {
    if (token && user) {
      chatAPI.ping().catch(() => {});
      const interval = setInterval(() => {
        chatAPI.ping().catch(() => {});
      }, 25000);

      return () => clearInterval(interval);
    }
  }, [token, user?._id]);

  const logout = () => {
    chatAPI.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isAssistant: user?.role === 'assistant',
      isJobseeker: user?.role === 'jobseeker',
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
