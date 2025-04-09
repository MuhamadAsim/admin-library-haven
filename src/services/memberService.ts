
import api from './api';
import { Member } from '@/lib/data';

// Get all members
export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get('/members');
    
    // Validate the response data
    if (!response.data || !Array.isArray(response.data)) {
      console.error("Invalid members data from API:", response.data);
      return [];
    }
    
    // Ensure each member has an id (either MongoDB _id or custom id)
    return response.data.map(member => ({
      ...member,
      id: member.id || member._id || `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

// Get member by ID
export const getMemberById = async (id: string): Promise<Member> => {
  const response = await api.get(`/members/${id}`);
  return {
    ...response.data,
    id: response.data.id || response.data._id
  };
};

// Add new member
export const addMember = async (member: Omit<Member, 'id'>): Promise<Member> => {
  const response = await api.post('/members', member);
  return {
    ...response.data,
    id: response.data.id || response.data._id
  };
};

// Update member
export const updateMember = async (id: string, member: Partial<Member>): Promise<Member> => {
  const response = await api.put(`/members/${id}`, member);
  return {
    ...response.data,
    id: response.data.id || response.data._id
  };
};

// Delete member
export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/members/${id}`);
};
