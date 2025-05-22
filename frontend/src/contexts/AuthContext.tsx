import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthContextType } from '../types';
import WebApp from '@twa-dev/sdk';

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
const IS_DEV_MODE = import.meta.env.DEV || !window.Telegram?.WebApp;

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
      // Check if we're in development mode
      if (IS_DEV_MODE) {
        console.log('Development mode detected, using mock user data');
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setLoading(false);
        return;
      }
      
      // Get user data from Telegram WebApp
      const initData = WebApp.initData;
      
      // If no initData available even in production, fallback to mock data
      if (!initData || initData === '') {
        console.warn('No Telegram WebApp data available, using mock data as fallback');
        setUser(MOCK_USER);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setLoading(false);
        return;
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
      
      // Fallback to mock user in case of error
      if (IS_DEV_MODE) {
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
      if (IS_DEV_MODE) {
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