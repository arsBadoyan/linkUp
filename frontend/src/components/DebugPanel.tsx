import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugPanel: React.FC = () => {
  const { user, forceReauth } = useAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const debugEnabled = searchParams.get('debug') === 'true';

  const telegramRaw = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) || null;
  const initData = telegramRaw?.initData || 'Not available';
 
  // API URL logic (same as in contexts)
  const getApiUrl = () => {
    // Check multiple signs of production environment
    const isProduction = import.meta.env.PROD || 
                        import.meta.env.MODE === 'production' ||
                        window.location.protocol === 'https:' ||
                        window.location.hostname.includes('railway.app');
    
    if (isProduction) {
      return 'https://linkup-backend-production.up.railway.app';
    }
    
    try {
      return import.meta.env.VITE_API_URL || 'http://localhost:8001';
    } catch (e) {
              return 'http://localhost:8001';
    }
  };

  const apiUrl = getApiUrl();
  const isProduction = import.meta.env.PROD || 
                      import.meta.env.MODE === 'production' ||
                      window.location.protocol === 'https:' ||
                      window.location.hostname.includes('railway.app');

  if (!debugEnabled) return null;

  return (
    <div style={{ background: '#f4f4f4', padding: '1rem', margin: '1rem 0', borderRadius: 8 }}>
      <h3>🔍 Debug Panel</h3>
      
      <div style={{ background: '#ffcccc', padding: '0.5rem', margin: '1rem 0', borderRadius: 4 }}>
        <p><strong>🔄 Cache Buster:</strong> v{Date.now()}</p>
        <p><strong>📅 Build Time:</strong> {new Date().toISOString()}</p>
        <p><strong>🚀 Last Deploy:</strong> 2025-05-24T11:45:00Z - FORCED</p>
      </div>

      <p><strong>Environment:</strong></p>
      <pre style={{ background: '#fff', padding: 10, borderRadius: 4 }}>
        PROD: {String(import.meta.env.PROD)}
        DEV: {String(import.meta.env.DEV)}
        MODE: {import.meta.env.MODE}
        VITE_API_URL: {import.meta.env.VITE_API_URL || 'not set'}
        Is Production: {String(isProduction)}
        Protocol: {window.location.protocol}
        Hostname: {window.location.hostname}
      </pre>

      <p><strong>API URL:</strong> <span style={{color: apiUrl.startsWith('https') ? 'green' : 'red'}}>{apiUrl}</span></p>

      <p><strong>Telegram Available:</strong> {telegramRaw ? '✅ Yes' : '❌ No'}</p>
      <p><strong>initData length:</strong> {initData.length || 0}</p>

      <p><strong>initData:</strong></p>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflowY: 'auto', background: '#fff', padding: 10, borderRadius: 4 }}>
        {initData}
      </pre>

      <p><strong>User object:</strong></p>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', padding: 10, borderRadius: 4 }}>
        {JSON.stringify(user, null, 2)}
      </pre>

      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={forceReauth}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: 4, 
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          🔄 Force Re-auth
        </button>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: 4, 
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          🗑️ Clear Cache & Reload
        </button>
        
        <button 
          onClick={() => {
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.close();
              setTimeout(() => window.location.reload(), 1000);
            } else {
              window.location.reload();
            }
          }}
          style={{ 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: 4, 
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          🔄 Hard Refresh
        </button>
        
        <button 
          onClick={async () => {
            try {
              const apiUrl = getApiUrl();
              const response = await fetch(`${apiUrl}/users/auth`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  initData: '',
                  createNewUser: true
                })
              });
              
              if (response.ok) {
                const newUser = await response.json();
                console.log('Created new test user:', newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                window.location.reload();
              } else {
                console.error('Failed to create new user');
              }
            } catch (error) {
              console.error('Error creating new user:', error);
            }
          }}
          style={{ 
            background: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: 4, 
            cursor: 'pointer'
          }}
        >
          👤 Create New Test User
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;