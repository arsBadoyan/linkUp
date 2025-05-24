import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EventsProvider } from './contexts/EventsContext';
import { safeReady, safeMainButton } from '../safe-telegram-webapp';
import BottomNavigation from './components/BottomNavigation';
import DebugPanel from './components/DebugPanel';

// Pages
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import EventResponsesPage from './pages/EventResponsesPage';
import MyEventsPage from './pages/MyEventsPage';

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
    
    // Force cache refresh in Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const version = Date.now();
      console.log('🔄 Cache buster version:', version);
      // Force Railway deploy - timestamp: 2025-05-24T11:45:00Z - DEPLOY_NOW
      
      // Super aggressive cache busting for Telegram
      const WebApp = window.Telegram.WebApp;
      if (WebApp) {
        WebApp.ready();
        // Force version update
        console.log('📱 Telegram WebApp initialized');
        // Try to force cache invalidation
        const currentUrl = window.location.href;
        const separator = currentUrl.includes('?') ? '&' : '?';
        const cacheParam = `_t=${version}&_cb=${Math.random().toString(36).substr(2, 9)}`;
        if (!currentUrl.includes('_t=')) {
          console.log('🚀 Forcing cache refresh...');
          const newUrl = `${currentUrl}${separator}${cacheParam}`;
          history.replaceState(null, '', newUrl);
        }
      }
    }
    
    // Clean up on unmount
    return () => {
      safeMainButton.hide();
    };
  }, []);
  
  return (
    <EventsProvider>
      <div className="bg-gray-100 min-h-screen pb-16">
        {/* Debug Panel - show only if URL contains ?debug=true */}
        {(window.location.search.includes('debug=true') || window.location.href.includes('debug=true')) && <DebugPanel />}
        
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/events" /> : <AuthPage />} />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/my" element={
            <ProtectedRoute>
              <MyEventsPage />
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
        
        {user && (
          <BottomNavigation />
        )}
      </div>
    </EventsProvider>
  );
};

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