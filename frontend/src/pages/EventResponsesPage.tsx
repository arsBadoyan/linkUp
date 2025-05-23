import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { Event, EventResponse, User } from '../types';
import BackButton from '../components/BackButton';

const EventResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, updateEventResponse } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        navigate('/events');
        return;
      }
      try {
        const eventData = await getEvent(id);
        setEvent(eventData);
        
        // Check if user is the creator
        if (user?.id !== eventData.creator_id) {
          console.log('User is not the creator of this event. Redirecting...');
          navigate('/events');
          return;
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent, user, navigate]);

  const handleResponseUpdate = async (responseId: string, status: string) => {
    if (!event) return;
    try {
      await updateEventResponse(responseId, { status });
      // Refresh event data
      const updatedEvent = await getEvent(event.id);
      setEvent(updatedEvent);
    } catch (error) {
      console.error('Error updating response:', error);
    }
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

  // This should not happen due to the useEffect check, but keeping as safety
  if (!user || user.id !== event.creator_id) {
    return (
      <div className="p-4">
        <BackButton to="/events" className="mb-4" />
        <div className="text-center text-gray-600">You don't have permission to view responses for this event</div>
      </div>
    );
  }

  const pendingResponses = event.responses?.filter(r => r.status === 'pending') || [];
  const acceptedResponses = event.responses?.filter(r => r.status === 'accepted') || [];
  const rejectedResponses = event.responses?.filter(r => r.status === 'rejected') || [];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <BackButton to={`/events/${event.id}`} className="mr-4" />
        <h1 className="text-2xl font-bold">Event Responses</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">{event.title}</h2>
        
        {/* Pending Responses */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-yellow-700">
            Pending Responses ({pendingResponses.length})
          </h3>
          
          {pendingResponses.length === 0 ? (
            <p className="text-gray-500">No pending responses</p>
          ) : (
            <div className="space-y-3">
              {pendingResponses.map((response) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={response.user?.avatar_url || 'https://via.placeholder.com/40'} 
                        alt={response.user?.name || 'User'}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{response.user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">
                          Responded on {new Date(response.responded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleResponseUpdate(response.id, 'accepted')}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponseUpdate(response.id, 'rejected')}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Responses */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-green-700">
            Accepted Responses ({acceptedResponses.length})
          </h3>
          
          {acceptedResponses.length === 0 ? (
            <p className="text-gray-500">No accepted responses</p>
          ) : (
            <div className="space-y-3">
              {acceptedResponses.map((response) => (
                <div key={response.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={response.user?.avatar_url || 'https://via.placeholder.com/40'} 
                        alt={response.user?.name || 'User'}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{response.user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">
                          Accepted on {new Date(response.responded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm">
                      ✓ Accepted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected Responses */}
        {rejectedResponses.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-red-700">
              Rejected Responses ({rejectedResponses.length})
            </h3>
            
            <div className="space-y-3">
              {rejectedResponses.map((response) => (
                <div key={response.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={response.user?.avatar_url || 'https://via.placeholder.com/40'} 
                        alt={response.user?.name || 'User'}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{response.user?.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-600">
                          Rejected on {new Date(response.responded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm">
                      ✗ Rejected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventResponsesPage; 