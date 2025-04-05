
import api from './api';
import { ActivityLog } from '@/lib/data';

// Get all activity logs
export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await api.get('/activity-logs');
  return response.data;
};

// Get activity logs by user
export const getActivityLogsByUser = async (userId: string): Promise<ActivityLog[]> => {
  const response = await api.get(`/activity-logs/user/${userId}`);
  return response.data;
};

// Add new activity log
export const addActivityLog = async (log: Omit<ActivityLog, 'id' | '_id' | 'timestamp'>): Promise<ActivityLog> => {
  const response = await api.post('/activity-logs', log);
  return response.data;
};
