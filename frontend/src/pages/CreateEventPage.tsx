import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
import WebApp from '@twa-dev/sdk';

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
      
      WebApp.showPopup({
        title: 'Success',
        message: 'Your event has been created!',
        buttons: [{ type: 'ok' }]
      });
      
      // Navigate back to events list
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      WebApp.showPopup({
        title: 'Error',
        message: 'Failed to create event. Please try again.',
        buttons: [{ type: 'ok' }]
      });
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          className="mr-3 text-blue-500"
          onClick={() => navigate('/events')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title*
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your event about?"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description*
          </label>
          <textarea
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell people more about your event..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location*
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where is it happening?"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time*
          </label>
          <input
            type="datetime-local"
            required
            className="w-full p-2 border border-gray-300 rounded-md"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as 'custom' | 'city' | 'business')}
          >
            <option value="custom">Custom</option>
            <option value="city">City Exploration</option>
            <option value="business">Business Networking</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage; 