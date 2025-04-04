
import api from './api';
import { Notification } from '@/lib/data';

// Get all notifications
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  const response = await api.put(`/notifications/${id}`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read/all');
};

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
