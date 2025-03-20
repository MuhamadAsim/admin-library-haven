
import api from './api';
import { Member } from '@/lib/data';

// Get all members
export const getMembers = async (): Promise<Member[]> => {
  const response = await api.get('/members');
  return response.data;
};

// Get member by ID
export const getMemberById = async (id: string): Promise<Member> => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

// Add new member
export const addMember = async (member: Omit<Member, 'id'>): Promise<Member> => {
  const response = await api.post('/members', member);
  return response.data;
};

// Update member
export const updateMember = async (id: string, member: Partial<Member>): Promise<Member> => {
  const response = await api.put(`/members/${id}`, member);
  return response.data;
};

// Delete member
export const deleteMember = async (id: string): Promise<void> => {
  await api.delete(`/members/${id}`);
};
