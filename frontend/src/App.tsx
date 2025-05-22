import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EventsProvider } from './contexts/EventsContext';
import { safeReady, safeMainButton } from '../safe-telegram-webapp';

// Pages
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import EventResponsesPage from './pages/EventResponsesPage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Initialize Telegram Web App
    safeReady();
    
    // Configure main button if needed
    safeMainButton.hide();
    
    // Clean up on unmount
    return () => {
      safeMainButton.hide();
    };
  }, []);
  
  return (
    <EventsProvider>
      <div className="bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/events" /> : <AuthPage />} />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/create" element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:id" element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:id/edit" element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:id/responses" element={
            <ProtectedRoute>
              <EventResponsesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/events" />} />
        </Routes>
      </div>
    </EventsProvider>
  );
};

// Wrap App content with Auth Provider
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App; 