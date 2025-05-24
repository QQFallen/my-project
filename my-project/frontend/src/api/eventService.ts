import { axiosInstance } from './axiosInstance';
import { Event } from '../types';

export const eventService = {
  getEvents: async () => {
    const response = await axiosInstance.get('/api/events');
    return response.data;
  },

  getUserEvents: async (userId: string) => {
    const response = await axiosInstance.get(`/api/events/user/${userId}`);
    return response.data;
  },

  createEvent: async (eventData: Omit<Event, 'id'>) => {
    const response = await axiosInstance.post('/api/events', eventData);
    return response.data;
  },

  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await axiosInstance.put(`/api/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await axiosInstance.delete(`/api/events/${eventId}`);
    return response.data;
  },
};
