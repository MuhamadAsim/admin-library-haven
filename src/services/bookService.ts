
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
  const response = await api.post('/books', book);
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
