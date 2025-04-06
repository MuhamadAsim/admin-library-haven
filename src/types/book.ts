
// Book related types
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

// Define book reference type
export type BookReference = string | { id: string; _id?: string; title?: string; author?: string };
