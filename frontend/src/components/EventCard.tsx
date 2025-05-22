import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface EventCardProps {
  event: Event;
  onRespond?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRespond }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCreator = user?.id === event.creator_id;
  
  // Format the event date
  const formattedDate = format(new Date(event.datetime), 'MMM d, yyyy • h:mm a');
  
  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };
  
  const handleRespondClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (onRespond) onRespond();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {event.type}
          </span>
        </div>
        
        <p className="mt-2 text-gray-600 line-clamp-2">{event.description}</p>
        
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{event.location}</span>
        </div>
        
        {event.creator && (
          <div className="mt-3 flex items-center">
            <img 
              src={event.creator.avatar_url || 'https://via.placeholder.com/40'} 
              alt={event.creator.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">Created by {event.creator.name}</span>
          </div>
        )}
        
        {!isCreator && event.is_open && (
          <button
            onClick={handleRespondClick}
            className="mt-3 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Respond
          </button>
        )}
        
        {isCreator && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}/edit`);
            }}
            className="mt-3 w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Edit Event
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard; 