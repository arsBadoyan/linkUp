import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
// Импортируем безопасные утилиты
import { safeShowPopup } from '../../safe-telegram-webapp';
import BackButton from '../components/BackButton';

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, loading } = useEvents();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [eventType, setEventType] = useState<'custom' | 'city' | 'business'>('custom');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert date string to ISO format
      const eventDate = new Date(dateTime);
      
      // Create the event
      await createEvent({
        title,
        description,
        location,
        datetime: eventDate.toISOString(),
        type: eventType,
        is_open: true
      });
      
      safeShowPopup({
        title: 'Success',
        message: 'Your event has been created!',
        buttons: [{ type: 'ok', text: 'OK' }]
      });
      
      // Navigate back to events list
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      safeShowPopup({
        title: 'Error',
        message: 'Failed to create event. Please try again.',
        buttons: [{ type: 'ok', text: 'OK' }]
      });
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <BackButton to="/events" className="mr-4" />
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Event Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your event"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Where will this event take place?"
          />
        </div>

        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">
            Date and Time
          </label>
          <input
            type="datetime-local"
            id="datetime"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as 'custom' | 'city' | 'business')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="custom">Custom Event</option>
            <option value="city">City Event</option>
            <option value="business">Business Event</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage; 