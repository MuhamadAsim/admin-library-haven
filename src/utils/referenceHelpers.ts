
import { MemberReference, BookReference } from '../types';
import { members } from '../data/members';
import { books } from '../data/books';

// Helper functions for handling references
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

// Helper function to extract ID from member or book reference
export const extractMemberId = (memberId: MemberReference): string => {
  if (typeof memberId === 'object' && memberId !== null) {
    return memberId.id;
  }
  return memberId as string;
};

// Helper function to extract ID from book reference
export const extractBookId = (bookId: BookReference): string => {
  if (typeof bookId === 'object' && bookId !== null) {
    return bookId.id;
  }
  return bookId as string;
};
