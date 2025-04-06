
import { Notification } from '../types';

// Sample data for notifications
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
