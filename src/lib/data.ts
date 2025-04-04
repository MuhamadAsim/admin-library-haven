
// Types
export interface Member {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Book {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  coverImage: string;
}

export interface Due {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  memberId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  fineAmount: number;
  status: 'pending' | 'paid' | 'waived';
  type?: 'late' | 'damage' | 'membership';
}

export interface Reservation {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  memberId: string;
  bookId: string;
  reservationDate: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  notificationSent: boolean;
}

export interface Notification {
  _id?: string;
  id?: string;
  userId: string;
  type: 'reservation' | 'due' | 'overdue' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Helper functions
export const getMemberName = (memberId: string): string => {
  return 'Member Name'; // Default implementation, should be replaced by API call
};

export const getBookTitle = (bookId: string): string => {
  return 'Book Title'; // Default implementation, should be replaced by API call
};
