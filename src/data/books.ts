
import { Book } from '../types';

// Sample data for books
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
