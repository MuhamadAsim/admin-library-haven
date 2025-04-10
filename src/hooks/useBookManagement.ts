
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Book, Member } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as memberService from "@/services/memberService";

export function useBookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
        });
        setBooks([]);
        setMembers([]);
      } finally {
        setBooksLoading(false);
        setMembersLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  return {
    books,
    setBooks,
    members,
    booksLoading,
    membersLoading
  };
}
