import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEventsPage = location.pathname === '/events' || location.pathname.startsWith('/events');
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        <button
          onClick={() => navigate('/events')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            isEventsPage ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={isEventsPage ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Events</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center p-2 rounded-lg ${
            isProfilePage ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <svg
            className="w-6 h-6"
            fill={isProfilePage ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation; 