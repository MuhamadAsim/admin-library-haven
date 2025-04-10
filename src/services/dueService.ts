
import api from './api';
import { Due, MemberReference, BookReference } from '@/types';
import { extractMemberId, extractBookId } from '@/utils/referenceHelpers';

// Get all dues
export const getDues = async (): Promise<Due[]> => {
  try {
    const response = await api.get('/dues');
    return response.data;
  } catch (error) {
    console.error("Error fetching all dues:", error);
    throw error;
  }
};

// Get due by ID
export const getDueById = async (id: string): Promise<Due> => {
  try {
    const response = await api.get(`/dues/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching due with id ${id}:`, error);
    throw error;
  }
};

// Get dues by member ID
export const getDuesByMemberId = async (memberId: string): Promise<Due[]> => {
  try {
    console.log("Fetching dues for member ID:", memberId);
    const response = await api.get(`/dues/member/${memberId}`);
    console.log("Dues response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching dues for member ${memberId}:`, error);
    throw error;
  }
};

// Add new due (issue a book)
export const addDue = async (due: Omit<Due, 'id' | '_id'>): Promise<Due> => {
  try {
    // Extract IDs if objects were passed
    const payload = {
      ...due,
      memberId: extractMemberId(due.memberId),
      bookId: extractBookId(due.bookId)
    };
    
    console.log("Adding due with payload:", payload);
    const response = await api.post('/dues', payload);
    console.log("Due addition response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding due record:", error);
    throw error;
  }
};

// Update due (return a book, pay fine, etc.)
export const updateDue = async (id: string, due: Partial<Omit<Due, 'id' | '_id' | 'memberId' | 'bookId'>>): Promise<Due> => {
  try {
    console.log(`Updating due ${id} with:`, due);
    const response = await api.put(`/dues/${id}`, due);
    console.log("Due update response:", response.data);
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
