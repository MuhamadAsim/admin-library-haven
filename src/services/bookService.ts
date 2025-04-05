
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
  try {
    console.log("Sending book data:", book);
    const response = await api.post('/books', {
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
    console.log("Book added response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

// Update book
export const updateBook = async (id: string, book: Partial<Book>): Promise<Book> => {
  try {
    console.log("Updating book:", id, book);
    const response = await api.put(`/books/${id}`, book);
    console.log("Book update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

// Delete book
export const deleteBook = async (id: string): Promise<void> => {
  try {
    await api.delete(`/books/${id}`);
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};
