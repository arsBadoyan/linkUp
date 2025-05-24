import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { Event } from '../types';
import { format } from 'date-fns';

const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userEvents, loading } = useEvents();
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (userEvents) {
      // Сортируем события по дате - новые сверху
      const sorted = [...userEvents].sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
      setSortedEvents(sorted);
    }
  }, [userEvents]);

  const getEventStatusColor = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.datetime);
    
    if (eventDate < now) {
      return 'bg-gray-100 text-gray-600'; // Прошедшие события
    } else if (!event.is_open) {
      return 'bg-red-100 text-red-600'; // Закрытые события
    } else {
      return 'bg-green-100 text-green-600'; // Активные события
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.datetime);
    
    if (eventDate < now) {
      return 'Completed';
    } else if (!event.is_open) {
      return 'Closed';
    } else {
      return 'Active';
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <button
          onClick={() => navigate('/events/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Create
        </button>
      </div>

      {/* Events count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Total events: {sortedEvents.length}
        </p>
      </div>

      {/* Events list */}
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-4">Create your first event and start meeting people!</p>
          <button
            onClick={() => navigate('/events/create')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create first event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.datetime), 'dd.MM.yyyy • HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getEventStatusColor(event)}`}>
                      {getEventStatus(event)}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.025" />
                    </svg>
                    <span>{event.responses?.length || 0} responses</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage; 