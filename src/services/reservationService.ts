
import api from './api';
import { Reservation } from '@/lib/data';

// Get all reservations
export const getReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations');
  return response.data;
};

// Get reservation by ID
export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

// Add new reservation
export const addReservation = async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const response = await api.post('/reservations', reservation);
  return response.data;
};

// Update reservation
export const updateReservation = async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
  const response = await api.put(`/reservations/${id}`, reservation);
  return response.data;
};

// Delete reservation
export const deleteReservation = async (id: string): Promise<void> => {
  await api.delete(`/reservations/${id}`);
};

// Get reservations by member
export const getReservationsByMember = async (memberId: string): Promise<Reservation[]> => {
  const response = await api.get(`/reservations/member/${memberId}`);
  return response.data;
};

// Get reservations by book
export const getReservationsByBook = async (bookId: string): Promise<Reservation[]> => {
  const response = await api.get(`/reservations/book/${bookId}`);
  return response.data;
};

// Reserve a book
export const reserveBook = async (bookId: string, memberId: string): Promise<Reservation> => {
  const response = await api.post(`/books/${bookId}/reserve`, { memberId });
  return response.data;
};
