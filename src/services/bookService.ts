
import api from './api';
import { Book } from '@/lib/data';

// Get all books
export const getBooks = async (): Promise<Book[]> => {
  const response = await api.get('/books');
  return response.data;
};

// Get book by ID
export const getBookById = async (id: string): Promise<Book> => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

// Add new book
export const addBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
  const response = await api.post('/books', {
    ...book,
    // MongoDB will generate the ID, so we don't need to send it
    // but ensure all required fields are sent
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    publishedYear: book.publishedYear,
    genre: book.genre,
    description: book.description,
    totalCopies: book.totalCopies || 1,
    availableCopies: book.availableCopies || book.totalCopies || 1,
    status: book.status || 'available',
    coverImage: book.coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'
  });
  return response.data;
};

// Update book
export const updateBook = async (id: string, book: Partial<Book>): Promise<Book> => {
  const response = await api.put(`/books/${id}`, book);
  return response.data;
};

// Delete book
export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};
