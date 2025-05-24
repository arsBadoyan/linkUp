import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import DebugPanel from '../components/DebugPanel';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    photos: user?.photos || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'interests' ? value.split(',').map(i => i.trim()) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BackButton to="/events" className="mr-4" />
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <button
          onClick={() => {
            console.log('Debug button clicked, current showDebug:', showDebug);
            setShowDebug(!showDebug);
          }}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div style={{ background: '#f0f0f0', padding: '1rem', margin: '1rem 0', border: '2px solid red' }}>
          <p style={{ color: 'red', fontWeight: 'bold' }}>Debug panel should appear here: showDebug = {String(showDebug)}</p>
          <p>User ID: {user?.id}</p>
          <p>User Name: {user?.name}</p>
          <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}</p>
          
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:8001/users/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ initData: '', createNewUser: true })
                  });
                  const newUser = await response.json();
                  console.log('Created new user:', newUser);
                  
                  // Update localStorage and reload page
                  localStorage.setItem('user', JSON.stringify(newUser));
                  window.location.reload();
                } catch (error) {
                  console.error('Error creating new user:', error);
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
              🔄 Create New Test User
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
              🗑️ Clear & Restart
            </button>
          </div>
          
          <DebugPanel />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                name="interests"
                value={formData.interests.join(', ')}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Edit Profile
              </button>
            </div>

            {user.avatar_url && (
              <div className="mb-6">
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-32 h-32 rounded-full"
                />
              </div>
            )}

            {user.bio && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500">About</h3>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            {user.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500">Interests</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.photos.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Photos</h3>
                <div className="grid grid-cols-3 gap-4">
                  {user.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 