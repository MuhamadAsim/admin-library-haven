
import { Reservation } from '../types';

// Sample data for reservations
export const reservations: Reservation[] = [
  {
    id: "r1",
    memberId: "m1",
    bookId: "b3",
    reservationDate: "2024-03-20",
    status: "pending",
    notificationSent: false
  },
  {
    id: "r2",
    memberId: "m2",
    bookId: "b1",
    reservationDate: "2024-03-18",
    status: "fulfilled",
    notificationSent: true
  },
  {
    id: "r3",
    memberId: "m3",
    bookId: "b2",
    reservationDate: "2024-03-15",
    status: "cancelled",
    notificationSent: true
  }
];
