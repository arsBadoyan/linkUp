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

// API URL from environment variable with fallback
const getApiUrl = () => {
  // В production используем правильный production backend URL
  if (import.meta.env.PROD) {
    return 'https://linkup-backend-production.up.railway.app';
  }
  
  // В dev режиме проверяем переменную окружения или используем localhost
  try {
    return import.meta.env.VITE_API_URL || 'http://localhost:8000';
  } catch (e) {
    return 'http://localhost:8000';
  }
};

const API_URL = getApiUrl();

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
      const params = new URLSearchParams();
      
      // Добавляем фильтры, если они переданы
      if (filters) {
        if (filters.type) params.append('event_type', filters.type);
        if (filters.location) params.append('location', filters.location);
        if (filters.date) {
          // Convert date string to proper format if needed
          params.append('date', filters.date);
        }
      }
      
      // Формируем строку запроса только если есть параметры
      const queryString = params.toString();
      const queryParams = queryString ? `?${queryString}` : '';
      
      console.log(`Fetching events with URL: ${API_URL}/events${queryParams}`);
      
      const response = await axios.get(`${API_URL}/events${queryParams}`);
      console.log('Events fetched successfully:', response.data);
      setEvents(response.data);
    } catch (error: any) {
      console.error('Fetch events error:', error);
      // Выводим более подробную информацию об ошибке
      if (error.response) {
        // Ответ получен, но со статусом ошибки
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Failed to load events: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // Запрос отправлен, но ответ не получен
        console.error('Error request:', error.request);
        setError('Failed to load events: No response from server');
      } else {
        // Что-то еще пошло не так
        setError(`Failed to load events: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    
    try {
      console.log(`Fetching user events: ${API_URL}/events/user/${user.id}`);
      const response = await axios.get(`${API_URL}/events/user/${user.id}`);
      console.log('User events fetched successfully:', response.data);
      setUserEvents(response.data);
    } catch (error: any) {
      console.error('Fetch user events error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getEvent = async (id: string): Promise<Event> => {
    if (!user) throw new Error('You must be logged in to view event details');

    setLoading(true);
    setError(null);
    
    try {
      // Не передаем user_id, так как бэкенд его не требует
      console.log(`Fetching event details: ${API_URL}/events/${id}`);
      const response = await axios.get(`${API_URL}/events/${id}`);
      console.log('Event details fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get event error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Failed to load event details: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError('Failed to load event details: No response from server');
      } else {
        setError(`Failed to load event details: ${error.message}`);
      }
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
      const response = await axios.post(`${API_URL}/events?user_id=${user.id}`, eventData);
      
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
      const response = await axios.put(`${API_URL}/events/${id}?user_id=${user.id}`, eventData);
      
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
      console.log(`Sending response to event: ${API_URL}/responses, event_id=${eventId}`);
      const response = await axios.post(`${API_URL}/responses`, {
        event_id: eventId,
        user_id: user.id  // Здесь user_id необходим в теле запроса
      });
      console.log('Response sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Respond to event error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Failed to respond to event: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError('Failed to respond to event: No response from server');
      } else {
        setError(`Failed to respond to event: ${error.message}`);
      }
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
      console.log(`Updating response: ${API_URL}/responses/${responseId}`);
      const response = await axios.put(`${API_URL}/responses/${responseId}`, {
        ...data,
        user_id: user.id  // user_id необходим в теле запроса
      });
      console.log('Response updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update response error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        setError(`Failed to update response: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setError('Failed to update response: No response from server');
      } else {
        setError(`Failed to update response: ${error.message}`);
      }
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