import React, { createContext, useState, useEffect, useContext } from 'react';
import type { User } from '../services/auth/types';
import { AuthService } from '../services/auth/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await AuthService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokenData = await AuthService.login(email, password);
      localStorage.setItem('token', tokenData.access_token);
      
      const userData = await AuthService.getMe();
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Đăng nhập thất bại.');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      await AuthService.register(email, password, fullName);
      await login(email, password);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Đăng ký thất bại.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Không thể refresh thông tin user:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
