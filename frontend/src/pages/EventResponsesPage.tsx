import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventsContext';
import { Event, EventResponse, User } from '../types';

const EventResponsesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, updateEventResponse } = useEvents();
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
        <div className="text-center text-gray-600">Event not found</div>
      </div>
    );
  }

  if (!user || user.id !== event.creator_id) {
    navigate('/events');
    return null;
  }

  const pendingResponses = event.responses?.filter(r => r.status === 'pending') || [];
  const acceptedResponses = event.responses?.filter(r => r.status === 'accepted') || [];
  const rejectedResponses = event.responses?.filter(r => r.status === 'rejected') || [];

  const ResponseCard: React.FC<{ response: EventResponse; user: User }> = ({ response, user }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center">
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-12 h-12 rounded-full mr-4"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{user.name}</h3>
          {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
        </div>
      </div>

      {response.status === 'pending' && (
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => handleResponseUpdate(response.id, 'accepted')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={() => handleResponseUpdate(response.id, 'rejected')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Responses to {event.title}</h1>

      {pendingResponses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Responses</h2>
          {pendingResponses.map(response => (
            <ResponseCard
              key={response.id}
              response={response}
              user={response.user!}
            />
          ))}
        </div>
      )}

      {acceptedResponses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Accepted</h2>
          {acceptedResponses.map(response => (
            <ResponseCard
              key={response.id}
              response={response}
              user={response.user!}
            />
          ))}
        </div>
      )}

      {rejectedResponses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Rejected</h2>
          {rejectedResponses.map(response => (
            <ResponseCard
              key={response.id}
              response={response}
              user={response.user!}
            />
          ))}
        </div>
      )}

      {!event.responses?.length && (
        <div className="text-center text-gray-500">
          No responses yet
        </div>
      )}
    </div>
  );
};

export default EventResponsesPage; 