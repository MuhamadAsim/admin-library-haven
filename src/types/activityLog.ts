
// ActivityLog related types
export interface ActivityLog {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  userId: string;
  action: 'borrow' | 'return' | 'reserve' | 'cancel_reservation' | 'payment' | 'membership_update';
  bookId?: string;
  details?: any;
  timestamp: string;
}
