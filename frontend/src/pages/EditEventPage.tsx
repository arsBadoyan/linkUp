import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import BackButton from '../components/BackButton';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, updateEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    datetime: '',
    type: 'custom' as 'custom' | 'city' | 'business',
    is_open: true
  });

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
        
        setFormData({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          datetime: new Date(eventData.datetime).toISOString().slice(0, 16),
          type: eventData.type,
          is_open: eventData.is_open
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, getEvent, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !user) return;

    setSaving(true);
    try {
      await updateEvent(event.id, {
        ...formData,
        datetime: new Date(formData.datetime).toISOString()
      });
      navigate(`/events/${event.id}`);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'type' 
          ? (value as 'custom' | 'city' | 'business') 
          : value
    }));
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
  if (user?.id !== event.creator_id) {
    return (
      <div className="p-4">
        <BackButton to="/events" className="mb-4" />
        <div className="text-center text-gray-600">You don't have permission to edit this event</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <BackButton to={`/events/${event.id}`} className="mr-4" />
        <h1 className="text-2xl font-bold">Edit Event</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">Date and Time</label>
          <input
            type="datetime-local"
            id="datetime"
            name="datetime"
            value={formData.datetime}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="custom">Custom</option>
            <option value="city">City</option>
            <option value="business">Business</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_open"
            name="is_open"
            checked={formData.is_open}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_open" className="ml-2 block text-sm text-gray-900">
            Open for responses
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/events/${event.id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage; 