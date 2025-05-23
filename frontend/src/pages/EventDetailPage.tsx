import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { Event } from '../types';
import BackButton from '../components/BackButton';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, respondToEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const eventData = await getEvent(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent]);

  const handleRespond = async () => {
    if (!event || !user) return;
    try {
      await respondToEvent(event.id);
      // Refresh event data to show updated responses
      const updatedEvent = await getEvent(event.id);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Error responding to event:', error);
    }
  };

  const handleEdit = () => {
    if (!event) return;
    navigate(`/events/${event.id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4">
        <BackButton to="/events" className="mb-4" />
        <div className="text-center text-gray-600">Event not found</div>
      </div>
    );
  }

  const isCreator = user?.id === event.creator_id;
  const hasResponded = event.responses?.some(response => response.user_id === user?.id);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <BackButton to="/events" className="mr-4" />
        <h1 className="text-2xl font-bold">Event Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
        
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Location</h3>
            <p className="text-gray-900">{event.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Date & Time</h3>
            <p className="text-gray-900">
              {new Date(event.datetime).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Show event creator */}
        {event.creator && (
          <div className="mb-6 flex items-center">
            <img 
              src={event.creator.avatar_url || 'https://via.placeholder.com/40'} 
              alt={event.creator.name}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Created by</p>
              <p className="text-sm text-gray-600">{event.creator.name}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          {isCreator ? (
            <div className="space-x-4 w-full">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Event
              </button>
              <button
                onClick={() => navigate(`/events/${event.id}/responses`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                View Responses ({event.responses?.length || 0})
              </button>
            </div>
          ) : (
            <div className="w-full">
              {event.is_open && !hasResponded ? (
                <button
                  onClick={handleRespond}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Join Event
                </button>
              ) : hasResponded ? (
                <div className="w-full text-center py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                  ✓ You've already joined this event
                </div>
              ) : (
                <div className="w-full text-center py-3 bg-gray-100 text-gray-600 rounded-lg font-medium">
                  This event is no longer accepting responses
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 