import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        await login();
        navigate('/events');
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    handleAuth();
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-700">Authenticating...</h1>
        <p className="text-gray-500 mt-2">Please wait while we verify your Telegram account.</p>
      </div>
    </div>
  );
};

export default AuthPage; 