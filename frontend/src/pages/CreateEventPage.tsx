import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
// Импортируем безопасные утилиты
import { safeShowPopup } from '../../safe-telegram-webapp';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Date & Time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as 'custom' | 'city' | 'business')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="custom">Custom</option>
            <option value="city">City Exploration</option>
            <option value="business">Business Networking</option>
          </select>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage; 