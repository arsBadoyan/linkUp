import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugPanel: React.FC = () => {
  const { user, forceReauth } = useAuth();

  const telegramAvailable = typeof window !== 'undefined' &&
    typeof window.Telegram !== 'undefined' &&
    typeof window.Telegram.WebApp !== 'undefined';

  const initData = telegramAvailable ? (window.Telegram?.WebApp?.initData || '') : 'Telegram WebApp not available';

  return (
    <div style={{ background: '#f4f4f4', padding: '1rem', margin: '1rem 0', borderRadius: 8 }}>
      <h3>🔍 Debug Panel</h3>

      <p><strong>Telegram Available:</strong> {telegramAvailable ? '✅ Yes' : '❌ No'}</p>

      <p><strong>initData length:</strong> {initData.length || 0}</p>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflowY: 'auto', background: '#fff', padding: 10, borderRadius: 4 }}>
        {initData || 'No initData'}
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
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Cache & Reload
        </button>
      </div>
    </div>
  );
};

export default DebugPanel; 