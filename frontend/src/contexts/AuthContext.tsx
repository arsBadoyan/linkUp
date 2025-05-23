import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthContextType } from '../types';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: async () => {},
  forceReauth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// API URL from environment variable with fallback
const getApiUrl = () => {
  // Check multiple signs of production environment
  const isProduction = import.meta.env.PROD || 
                      import.meta.env.MODE === 'production' ||
                      window.location.protocol === 'https:' ||
                      window.location.hostname.includes('railway.app');
  
  // In production use the correct production backend URL
  if (isProduction) {
    return 'https://linkup-backend-production.up.railway.app';
  }
  
  // In dev mode check environment variable or use localhost
  try {
    return import.meta.env.VITE_API_URL || 'http://localhost:8001';
  } catch (e) {
          return 'http://localhost:8001';
  }
};

const API_URL = getApiUrl();

// Безопасная проверка наличия Telegram WebApp API
const isTelegramWebAppAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof window.Telegram !== 'undefined' && 
           typeof window.Telegram.WebApp !== 'undefined';
  } catch (e) {
    return false;
  }
};

// Mock user data for development
const MOCK_USER: User = {
  id: '12345',
  telegram_id: 12345,
  name: 'Test User',
  avatar_url: 'https://via.placeholder.com/100',
  bio: 'This is a mock user for development',
  interests: ['coding', 'testing'],
  photos: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (): Promise<void> => {
    setLoading(true);
    try {
      // Принудительно очищаем кеш для тестирования новой авторизации
      if (window.location.search.includes('clearCache')) {
        localStorage.clear();
        console.log('Cache cleared for testing');
      }
      
      // Get user data from Telegram WebApp (safely)
      let initData = '';
      try {
        if (isTelegramWebAppAvailable()) {
          initData = window.Telegram?.WebApp?.initData || '';
          console.log('Telegram WebApp initData length:', initData.length);
          console.log('Telegram WebApp initData first 100 chars:', initData.substring(0, 100));
        }
      } catch (e) {
        console.warn('Error accessing Telegram WebApp:', e);
      }
      
      // ВСЕГДА отправляем запрос на backend, даже с пустым initData
      // Backend сам решит что делать и создаст пользователя в БД
      console.log('Sending initData to backend for authentication...');
      const response = await axios.post(`${API_URL}/users/auth`, {
        initData
      });

      const userData = response.data;
      console.log('Received user data from backend:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      
      // Только в случае ошибки используем fallback к mock user
      console.warn('Authentication failed, using mock data as fallback');
      setUser(MOCK_USER);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      if (import.meta.env.DEV) {
        // В dev режиме используем mock обновление
        const updatedMockUser = {...user, ...userData, updated_at: new Date().toISOString()};
        setUser(updatedMockUser);
        localStorage.setItem('user', JSON.stringify(updatedMockUser));
        setLoading(false);
        return;
      }

      const response = await axios.put(`${API_URL}/users/${user.id}`, userData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceReauth = async (): Promise<void> => {
    console.log('Forcing re-authentication...');
    localStorage.clear();
    setUser(null);
    await login();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, forceReauth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);

export default AuthContext; 