
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Book, Member, Due } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as dueService from "@/services/dueService";
import * as activityLogService from "@/services/activityLogService";
import { BookManagementSearch } from "@/components/Books/BookManagementSearch";

interface IssueBookFormProps {
  books: Book[];
  members: Member[];
  booksLoading: boolean;
  membersLoading: boolean;
  onBookIssued: (updatedBooks: Book[]) => void;
}

export function IssueBookForm({
  books,
  members,
  booksLoading,
  membersLoading,
  onBookIssued,
}: IssueBookFormProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [issuanceLoading, setIssuanceLoading] = useState(false);
  const { toast } = useToast();

  const availableBooks = books.filter(book => book.availableCopies > 0);

  const membersForSearch = members.filter(member => member && typeof member === 'object').map(member => ({
    id: member.id || member._id || "",
    _id: member._id,
    label: member.name || "Unnamed Member",
    description: member.email || "No email provided"
  }));

  const booksForSearch = availableBooks.filter(book => book && typeof book === 'object').map(book => ({
    id: book.id || book._id || "",
    _id: book._id,
    label: book.title || "Untitled Book",
    description: book.author ? `by ${book.author} (Copies: ${book.availableCopies})` : `Copies: ${book.availableCopies}`
  }));

  const handleIssueBook = async () => {
    if (!selectedMemberId || !selectedBookId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a member and a book.",
      });
      return;
    }
    
    try {
      setIssuanceLoading(true);
      
      const book = books.find(b => b.id === selectedBookId || b._id === selectedBookId);
      if (!book || (book.availableCopies <= 0)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This book is not available for borrowing.",
        });
        return;
      }
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      const dueRecord = await dueService.addDue({
        memberId: selectedMemberId,
        bookId: selectedBookId,
        issueDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        fineAmount: 0,
        status: 'pending'
      });
      
      await activityLogService.addActivityLog({
        userId: selectedMemberId,
        action: 'borrow',
        bookId: selectedBookId,
        details: {
          dueDate: dueDate.toISOString(),
          issueDate: new Date().toISOString()
        }
      });
      
      const updatedBook = await bookService.updateBook(selectedBookId, {
        availableCopies: (book.availableCopies - 1),
        status: book.availableCopies <= 1 ? 'borrowed' : 'available'
      });
      
      const updatedBooks = books.map(b => 
        (b.id === selectedBookId || b._id === selectedBookId) ? updatedBook : b
      );
      
      onBookIssued(updatedBooks);
      setSelectedBookId("");
      
      toast({
        title: "Success",
        description: "Book has been issued successfully.",
      });
    } catch (error) {
      console.error("Error issuing book:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to issue book. Please try again.",
      });
    } finally {
      setIssuanceLoading(false);
    }
  };

  return (
    <>
      <BookManagementSearch 
        items={membersForSearch}
        selectedId={selectedMemberId}
        onSelect={setSelectedMemberId}
        placeholder="Search for a member..."
        label="Select Member"
        isLoading={membersLoading}
        emptyMessage="No members found."
      />
      
      <BookManagementSearch 
        items={booksForSearch}
        selectedId={selectedBookId}
        onSelect={setSelectedBookId}
        placeholder="Search for a book..."
        label="Select Book"
        isLoading={booksLoading}
        disabled={!selectedMemberId}
        emptyMessage="No available books found."
      />
      
      <Button 
        className="w-full" 
        disabled={!selectedMemberId || !selectedBookId || issuanceLoading}
        onClick={handleIssueBook}
      >
        {issuanceLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Issuing...
          </>
        ) : (
          "Issue Book"
        )}
      </Button>
    </>
  );
}
