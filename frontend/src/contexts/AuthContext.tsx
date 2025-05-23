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
});

interface AuthProviderProps {
  children: ReactNode;
}

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
      // Get user data from Telegram WebApp (safely)
      let initData = '';
      try {
        if (isTelegramWebAppAvailable()) {
          initData = window.Telegram?.WebApp?.initData || '';
        }
      } catch (e) {
        console.warn('Error accessing Telegram WebApp:', e);
      }
      
      // If no initData available, check if we should use dev mode
      if (!initData || initData === '') {
        if (import.meta.env.DEV && !isTelegramWebAppAvailable()) {
          console.log('Development mode detected without Telegram WebApp, using mock user data');
          setUser(MOCK_USER);
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
          setLoading(false);
          return;
        } else {
          console.warn('No Telegram WebApp data available');
          // В production режиме без initData выдаем ошибку
          throw new Error('Telegram WebApp data is required for authentication');
        }
      }

      // Send initData to backend for verification and user creation/retrieval
      const response = await axios.post(`${API_URL}/users/auth`, {
        initData
      });

      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock user only in dev mode without Telegram WebApp
      if (import.meta.env.DEV && !isTelegramWebAppAvailable()) {
        console.warn('Login failed, using mock data as fallback');
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
      } else {
        throw error;
      }
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
      if (import.meta.env.DEV && !isTelegramWebAppAvailable()) {
        // Mock update in dev mode
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);

export default AuthContext; 