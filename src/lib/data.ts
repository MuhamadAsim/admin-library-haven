
// Types
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipDate: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
  status: 'available' | 'borrowed' | 'reserved' | 'maintenance';
  coverImage: string;
}

export interface Due {
  id: string;
  memberId: string;
  bookId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  fineAmount: number;
  status: 'pending' | 'paid' | 'waived';
}

// Mock Data
export const members: Member[] = [
  {
    id: "m1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    address: "123 Main St, Anytown, USA",
    membershipDate: "2023-01-15",
    status: "active"
  },
  {
    id: "m2",
    name: "Emily Johnson",
    email: "emily.j@example.com",
    phone: "555-987-6543",
    address: "456 Oak Ave, Somewhere, USA",
    membershipDate: "2023-02-20",
    status: "active"
  },
  {
    id: "m3",
    name: "Michael Brown",
    email: "michael.b@example.com",
    phone: "555-456-7890",
    address: "789 Pine St, Nowhere, USA",
    membershipDate: "2023-03-10",
    status: "inactive"
  },
  {
    id: "m4",
    name: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "555-234-5678",
    address: "321 Elm St, Anywhere, USA",
    membershipDate: "2023-04-05",
    status: "active"
  },
  {
    id: "m5",
    name: "David Lee",
    email: "david.l@example.com",
    phone: "555-876-5432",
    address: "654 Maple Ave, Elsewhere, USA",
    membershipDate: "2023-05-25",
    status: "suspended"
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
    description: "A portrait of the Jazz Age in all of its decadence and excess.",
    status: "available",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2574&auto=format&fit=crop"
  },
  {
    id: "b2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780060935467",
    publishedYear: 1960,
    genre: "Classic Fiction",
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
    status: "borrowed",
    coverImage: "https://images.unsplash.com/photo-1603162525937-92a6920fadd9?q=80&w=2538&auto=format&fit=crop"
  },
  {
    id: "b3",
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    publishedYear: 1949,
    genre: "Dystopian Fiction",
    description: "A startling vision of a totalitarian future society.",
    status: "available",
    coverImage: "https://images.unsplash.com/photo-1591951425329-97d17b3f962d?q=80&w=2564&auto=format&fit=crop"
  },
  {
    id: "b4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "9780141439518",
    publishedYear: 1813,
    genre: "Classic Romance",
    description: "A classic tale of love and values in the class-conscious England of the late 18th century.",
    status: "reserved",
    coverImage: "https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?q=80&w=2680&auto=format&fit=crop"
  },
  {
    id: "b5",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "9780547928227",
    publishedYear: 1937,
    genre: "Fantasy",
    description: "A fantasy novel about the adventures of a hobbit named Bilbo Baggins.",
    status: "maintenance",
    coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=2574&auto=format&fit=crop"
  }
];

export const dues: Due[] = [
  {
    id: "d1",
    memberId: "m2",
    bookId: "b2",
    issueDate: "2023-10-01",
    dueDate: "2023-10-15",
    returnDate: null,
    fineAmount: 5.50,
    status: "pending"
  },
  {
    id: "d2",
    memberId: "m4",
    bookId: "b4",
    issueDate: "2023-09-20",
    dueDate: "2023-10-04",
    returnDate: "2023-10-06",
    fineAmount: 1.00,
    status: "paid"
  },
  {
    id: "d3",
    memberId: "m1",
    bookId: "b5",
    issueDate: "2023-09-15",
    dueDate: "2023-09-29",
    returnDate: "2023-10-10",
    fineAmount: 5.50,
    status: "paid"
  },
  {
    id: "d4",
    memberId: "m3",
    bookId: "b1",
    issueDate: "2023-08-25",
    dueDate: "2023-09-08",
    returnDate: null,
    fineAmount: 15.00,
    status: "pending"
  },
  {
    id: "d5",
    memberId: "m5",
    bookId: "b3",
    issueDate: "2023-10-05",
    dueDate: "2023-10-19",
    returnDate: "2023-10-18",
    fineAmount: 0,
    status: "waived"
  }
];

// Helper functions
export const getMemberName = (memberId: string): string => {
  const member = members.find(m => m.id === memberId);
  return member ? member.name : 'Unknown Member';
};

export const getBookTitle = (bookId: string): string => {
  const book = books.find(b => b.id === bookId);
  return book ? book.title : 'Unknown Book';
};
