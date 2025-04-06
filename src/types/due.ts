
import { MemberReference } from './member';
import { BookReference } from './book';

// Due related types
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
