import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { Event, EventResponse, EventsContextType, EventFilters } from '../types';
import { useAuth } from './AuthContext';

// Create context with default values
const EventsContext = createContext<EventsContextType>({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async () => {},
  createEvent: async () => ({} as Event),
  updateEvent: async () => ({} as Event),
  respondToEvent: async () => ({} as EventResponse),
  getEvent: async () => ({} as Event),
  updateEventResponse: async () => ({} as EventResponse),
  userEvents: []
});

interface EventsProviderProps {
  children: ReactNode;
}

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const EventsProvider: React.FC<EventsProviderProps> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch user events when user changes
  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const fetchEvents = async (filters?: EventFilters): Promise<void> => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      let queryParams = '';
      if (filters) {
        const params = new URLSearchParams();
        if (filters.type) params.append('event_type', filters.type);
        if (filters.location) params.append('location', filters.location);
        if (filters.date) {
          // Convert date string to proper format if needed
          params.append('date', filters.date);
        }
        queryParams = `?${params.toString()}`;
      }
      
      const response = await axios.get(`${API_URL}/events${queryParams}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Fetch events error:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/events/user/${user.id}`);
      setUserEvents(response.data);
    } catch (error) {
      console.error('Fetch user events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (id: string): Promise<Event> => {
    if (!user) throw new Error('You must be logged in to view event details');

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get event error:', error);
      setError('Failed to load event details. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'creator_id' | 'created_at' | 'updated_at'>): Promise<Event> => {
    if (!user) throw new Error('You must be logged in to create an event');

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/events`, {
        ...eventData,
        user_id: user.id
      });
      
      const newEvent = response.data;
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      setUserEvents(prevEvents => [newEvent, ...prevEvents]);
      return newEvent;
    } catch (error) {
      console.error('Create event error:', error);
      setError('Failed to create event. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event> => {
    if (!user) throw new Error('You must be logged in to update an event');

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/events/${id}`, {
        ...eventData,
        user_id: user.id
      });
      
      const updatedEvent = response.data;
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === id ? updatedEvent : event
        )
      );
      setUserEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === id ? updatedEvent : event
        )
      );
      return updatedEvent;
    } catch (error) {
      console.error('Update event error:', error);
      setError('Failed to update event. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const respondToEvent = async (eventId: string): Promise<EventResponse> => {
    if (!user) throw new Error('You must be logged in to respond to an event');

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/responses`, {
        event_id: eventId,
        user_id: user.id
      });
      
      return response.data;
    } catch (error) {
      console.error('Respond to event error:', error);
      setError('Failed to respond to event. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEventResponse = async (responseId: string, data: { status: string }): Promise<EventResponse> => {
    if (!user) throw new Error('You must be logged in to update a response');

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/responses/${responseId}`, {
        ...data,
        user_id: user.id
      });
      
      return response.data;
    } catch (error) {
      console.error('Update response error:', error);
      setError('Failed to update response. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventsContext.Provider 
      value={{ 
        events, 
        loading, 
        error, 
        fetchEvents, 
        createEvent, 
        updateEvent, 
        respondToEvent,
        getEvent,
        updateEventResponse,
        userEvents
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

// Custom hook to use the events context
export const useEvents = (): EventsContextType => useContext(EventsContext);

export default EventsContext; 