export interface User {
  id: string;
  telegram_id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  interests: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  creator_id: string;
  creator?: User;
  title: string;
  description: string;
  location: string;
  datetime: string;
  is_open: boolean;
  type: 'custom' | 'city' | 'business';
  created_at: string;
  updated_at: string;
  responses?: EventResponse[];
}

export interface EventResponse {
  id: string;
  event_id: string;
  user_id: string;
  user?: User;
  status: 'pending' | 'accepted' | 'rejected';
  responded_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  awarded_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  createEvent: (eventData: Omit<Event, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event>;
  respondToEvent: (eventId: string) => Promise<EventResponse>;
  getEvent: (id: string) => Promise<Event>;
  updateEventResponse: (responseId: string, data: { status: string }) => Promise<EventResponse>;
  userEvents: Event[];
}

export interface EventFilters {
  type?: string;
  interest?: string;
  location?: string;
  date?: string;
} 