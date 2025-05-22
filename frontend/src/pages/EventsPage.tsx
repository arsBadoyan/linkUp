import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
import { EventFilters } from '../types';
import EventCard from '../components/EventCard';
import WebApp from '@twa-dev/sdk';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading, error, fetchEvents, respondToEvent } = useEvents();
  const [filters, setFilters] = useState<EventFilters>({});
  
  // Fetch events on initial load
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle response to an event
  const handleRespond = async (eventId: string) => {
    try {
      await respondToEvent(eventId);
      WebApp.showPopup({
        title: 'Response Sent',
        message: 'Your response has been sent to the event creator. You will be notified if accepted.',
        buttons: [{ type: 'ok' }]
      });
    } catch (error) {
      console.error('Error responding to event:', error);
      WebApp.showPopup({
        title: 'Error',
        message: 'Failed to respond to the event. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchEvents(filters);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discover Events</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={() => navigate('/events/create')}
        >
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
            >
              <option value="">All Types</option>
              <option value="custom">Custom</option>
              <option value="city">City</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by location..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.location || ''}
              onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
            />
          </div>
        </div>
        <button
          className="w-full mt-3 bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-200"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading events...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No events found. Try adjusting your filters or create a new event!</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => navigate('/events/create')}
          >
            Create Event
          </button>
        </div>
      ) : (
        <div>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRespond={() => handleRespond(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage; 