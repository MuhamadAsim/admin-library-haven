
import api from './api';
import { Due, MemberReference, BookReference } from '@/lib/data';

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

// Get dues by member ID
export const getDuesByMemberId = async (memberId: string): Promise<Due[]> => {
  const response = await api.get(`/dues/member/${memberId}`);
  return response.data;
};

// Extract ID from member or book reference
const extractId = (ref: MemberReference | BookReference): string => {
  if (typeof ref === 'object' && ref !== null) {
    return ref.id;
  }
  return ref as string;
};

// Add new due (issue a book)
export const addDue = async (due: Omit<Due, 'id' | '_id'>): Promise<Due> => {
  try {
    // Extract IDs if objects were passed
    const payload = {
      ...due,
      memberId: extractId(due.memberId),
      bookId: extractId(due.bookId)
    };
    
    const response = await api.post('/dues', payload);
    return response.data;
  } catch (error) {
    console.error("Error adding due record:", error);
    throw error;
  }
};

// Update due (return a book, pay fine, etc.)
export const updateDue = async (id: string, due: Partial<Omit<Due, 'id' | '_id' | 'memberId' | 'bookId'>>): Promise<Due> => {
  try {
    const response = await api.put(`/dues/${id}`, due);
    return response.data;
  } catch (error) {
    console.error("Error updating due record:", error);
    throw error;
  }
};

// Delete due record
export const deleteDue = async (id: string): Promise<void> => {
  try {
    await api.delete(`/dues/${id}`);
  } catch (error) {
    console.error("Error deleting due record:", error);
    throw error;
  }
};
