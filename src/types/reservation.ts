
// Reservation related types
export interface Reservation {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  memberId: string;
  bookId: string;
  reservationDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  notificationSent: boolean;
}
