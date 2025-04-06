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

// Define member reference type
export type MemberReference = string | { id: string; _id?: string; name?: string; email?: string };

// Define book reference type
export type BookReference = string | { id: string; _id?: string; title?: string; author?: string };

export interface Due {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  memberId: MemberReference;
  bookId: BookReference;
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
  id: string;
  userId: string;
  type: 'reservation' | 'due' | 'overdue' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ActivityLog {
  _id?: string; // MongoDB ID
  id: string;   // Maintain compatibility with existing code
  userId: string;
  action: 'borrow' | 'return' | 'reserve' | 'cancel_reservation' | 'payment' | 'membership_update';
  bookId?: string;
  details?: any;
  timestamp: string;
}

// Sample data for development
export const members: Member[] = [
  {
    id: "m1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Anytown",
    membershipDate: "2023-01-15",
    status: "active"
  },
  {
    id: "m2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
    address: "456 Oak Ave, Somewhere",
    membershipDate: "2023-02-20",
    status: "active"
  },
  {
    id: "m3",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "345-678-9012",
    address: "789 Pine Rd, Nowhere",
    membershipDate: "2023-03-10",
    status: "inactive"
  }
];

export const books: Book[] = [
  {
    id: "b1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    publishedYear: 1925,
    genre: "Classic Fiction",
    description: "A story of wealth, love, and the American Dream in the 1920s.",
    totalCopies: 5,
    availableCopies: 3,
    status: "available",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop"
  },
  {
    id: "b2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    publishedYear: 1960,
    genre: "Classic Fiction",
    description: "A story of racial injustice and childhood innocence in the American South.",
    totalCopies: 3,
    availableCopies: 0,
    status: "borrowed",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2787&auto=format&fit=crop"
  },
  {
    id: "b3",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publishedYear: 1949,
    genre: "Dystopian",
    description: "A dystopian novel about a totalitarian regime and surveillance society.",
    totalCopies: 4,
    availableCopies: 2,
    status: "available",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2788&auto=format&fit=crop"
  }
];

export const dues: Due[] = [
  {
    id: "d1",
    memberId: "m1",
    bookId: "b2",
    issueDate: "2024-03-15",
    dueDate: "2024-03-29",
    returnDate: null,
    fineAmount: 0,
    status: "pending"
  },
  {
    id: "d2",
    memberId: "m2",
    bookId: "b3",
    issueDate: "2024-03-10",
    dueDate: "2024-03-24",
    returnDate: "2024-03-23",
    fineAmount: 0,
    status: "paid"
  },
  {
    id: "d3",
    memberId: "m3",
    bookId: "b1",
    issueDate: "2024-02-28",
    dueDate: "2024-03-13",
    returnDate: null,
    fineAmount: 10.5,
    status: "pending",
    type: "late"
  }
];

export const reservations: Reservation[] = [
  {
    id: "r1",
    memberId: "m1",
    bookId: "b3",
    reservationDate: "2024-03-20",
    status: "pending",
    notificationSent: false
  },
  {
    id: "r2",
    memberId: "m2",
    bookId: "b1",
    reservationDate: "2024-03-18",
    status: "fulfilled",
    notificationSent: true
  },
  {
    id: "r3",
    memberId: "m3",
    bookId: "b2",
    reservationDate: "2024-03-15",
    status: "cancelled",
    notificationSent: true
  }
];

export const notifications: Notification[] = [
  {
    id: "n1",
    userId: "m1",
    type: "due",
    title: "Book Due Soon",
    message: "Your book 'To Kill a Mockingbird' is due in 2 days.",
    date: "2024-03-27",
    read: false
  },
  {
    id: "n2",
    userId: "m2",
    type: "reservation",
    title: "Book Available",
    message: "Your reserved book 'The Great Gatsby' is now available.",
    date: "2024-03-18",
    read: true
  },
  {
    id: "n3",
    userId: "m3",
    type: "overdue",
    title: "Overdue Notice",
    message: "Your book 'The Great Gatsby' is overdue. Please return it soon.",
    date: "2024-03-14",
    read: false
  }
];

// Helper functions
export const getMemberName = (memberId: MemberReference): string => {
  if (typeof memberId === 'object' && memberId !== null) {
    return memberId.name || 'Unknown Member';
  }
  const member = members.find(m => m.id === memberId);
  return member ? member.name : 'Unknown Member';
};

export const getBookTitle = (bookId: BookReference): string => {
  if (typeof bookId === 'object' && bookId !== null) {
    return bookId.title || 'Unknown Book';
  }
  const book = books.find(b => b.id === bookId);
  return book ? book.title : 'Unknown Book';
};
