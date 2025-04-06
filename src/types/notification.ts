
// Notification related types
export interface Notification {
  _id?: string;
  id: string;
  userId: string;
  type: 'reservation' | 'due' | 'overdue' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}
