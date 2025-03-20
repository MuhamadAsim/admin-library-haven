
import api from './api';
import { Due } from '@/lib/data';

// Get all dues
export const getDues = async (): Promise<Due[]> => {
  const response = await api.get('/dues');
  return response.data;
};

// Get due by ID
export const getDueById = async (id: string): Promise<Due> => {
  const response = await api.get(`/dues/${id}`);
  return response.data;
};

// Add new due (issue a book)
export const addDue = async (due: Omit<Due, 'id'>): Promise<Due> => {
  const response = await api.post('/dues', due);
  return response.data;
};

// Update due (return a book, pay fine, etc.)
export const updateDue = async (id: string, due: Partial<Due>): Promise<Due> => {
  const response = await api.put(`/dues/${id}`, due);
  return response.data;
};

// Delete due record
export const deleteDue = async (id: string): Promise<void> => {
  await api.delete(`/dues/${id}`);
};
