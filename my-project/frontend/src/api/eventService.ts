import { axiosInstance } from './axiosInstance';
import { Event } from '../types';

export const eventService = {
  getEvents: async () => {
    const response = await axiosInstance.get('/api/events/user/0');
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

  registerForEvent: async (eventId: string) => {
    return Promise.resolve({ success: true });
  },

  getParticipantsCount: async (eventId: string) => {
    const response = await axiosInstance.get(`/api/participants/${eventId}/count`);
    return response.data.count;
  },

  isParticipating: async (eventId: string) => {
    const response = await axiosInstance.get(`/api/participants/${eventId}/isParticipating`);
    return response.data.isParticipating;
  },

  participate: async (eventId: string) => {
    const response = await axiosInstance.post(`/api/participants/${eventId}/participate`);
    return response.data;
  },

  getParticipantsList: async (eventId: string) => {
    const response = await axiosInstance.get(`/api/participants/${eventId}/list`);
    return response.data;
  }
};
