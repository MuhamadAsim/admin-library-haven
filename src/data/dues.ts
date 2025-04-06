
import { Due } from '../types';

// Sample data for dues
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
