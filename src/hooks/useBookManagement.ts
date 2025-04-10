
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Book, Member, Due } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as memberService from "@/services/memberService";
import * as dueService from "@/services/dueService";
import { authService } from "@/services/authService";

export function useBookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [userBorrowedBooks, setUserBorrowedBooks] = useState<Due[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [borrowedBooksLoading, setBorrowedBooksLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = authService.getCurrentUser();

  // Use useCallback to prevent the fetchData function from being recreated on every render
  const fetchData = useCallback(async () => {
    try {
      setBooksLoading(true);
      setMembersLoading(true);
      
      const fetchedBooks = await bookService.getBooks();
      const fetchedMembers = await memberService.getMembers();
      
      if (Array.isArray(fetchedBooks)) {
        setBooks(fetchedBooks);
      } else {
        console.error("Books data is not an array:", fetchedBooks);
        setBooks([]);
      }
      
      if (Array.isArray(fetchedMembers)) {
        setMembers(fetchedMembers);
      } else {
        console.error("Members data is not an array:", fetchedMembers);
        setMembers([]);
      }

      // Fetch user's borrowed books if logged in
      if (currentUser && currentUser.id) {
        try {
          setBorrowedBooksLoading(true);
          const userDues = await dueService.getDuesByMemberId(currentUser.id);
          if (Array.isArray(userDues)) {
            setUserBorrowedBooks(userDues);
          } else {
            console.error("User borrowed books data is not an array:", userDues);
            setUserBorrowedBooks([]);
          }
        } catch (error) {
          console.error("Error fetching user borrowed books:", error);
          setUserBorrowedBooks([]);
        } finally {
          setBorrowedBooksLoading(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data. Please try again later.",
      });
      setBooks([]);
      setMembers([]);
      setUserBorrowedBooks([]);
    } finally {
      setBooksLoading(false);
      setMembersLoading(false);
    }
  }, [toast, currentUser]);

  useEffect(() => {
    fetchData();
    // This is important - only include dependencies that should trigger a refetch
    // toast and currentUser are stable references so they won't cause re-renders
  }, [fetchData]);

  return {
    books,
    setBooks,
    members,
    userBorrowedBooks,
    setUserBorrowedBooks,
    booksLoading,
    membersLoading,
    borrowedBooksLoading
  };
}
