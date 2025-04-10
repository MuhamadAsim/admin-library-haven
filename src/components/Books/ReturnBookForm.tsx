
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Book, Member, Due } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as dueService from "@/services/dueService";
import * as activityLogService from "@/services/activityLogService";
import { BookManagementSearch } from "@/components/Books/BookManagementSearch";
import { ActiveBorrowingItem } from "@/components/Books/ActiveBorrowingItem";

interface ReturnBookFormProps {
  books: Book[];
  members: Member[];
  membersLoading: boolean;
  onBookReturned: (updatedBooks: Book[]) => void;
}

export function ReturnBookForm({ 
  books, 
  members, 
  membersLoading,
  onBookReturned 
}: ReturnBookFormProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [activeBorrowings, setActiveBorrowings] = useState<Due[]>([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(false);
  const { toast } = useToast();

  const membersForSearch = members.filter(member => member && typeof member === 'object').map(member => ({
    id: member.id || member._id || "",
    _id: member._id,
    label: member.name || "Unnamed Member",
    description: member.email || "No email provided"
  }));

  useEffect(() => {
    const fetchActiveBorrowings = async () => {
      if (!selectedMemberId) {
        setActiveBorrowings([]);
        return;
      }
      
      try {
        setActiveLoading(true);
        const allDues = await dueService.getDues();
        const memberDues = allDues.filter(due => {
          const dueMemId = due.memberId;
          if (!dueMemId) return false;
          
          return typeof dueMemId === 'string' 
            ? dueMemId === selectedMemberId
            : (dueMemId._id === selectedMemberId || dueMemId.id === selectedMemberId);
        }).filter(due => !due.returnDate);
        
        setActiveBorrowings(memberDues);
      } catch (error) {
        console.error("Error fetching active borrowings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch member's active borrowings.",
        });
      } finally {
        setActiveLoading(false);
      }
    };
    
    fetchActiveBorrowings();
  }, [selectedMemberId, toast]);

  const getBookTitle = (bookId: string) => {
    if (!bookId) return "Unknown Book";
    
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return "Unknown Book";
    
    return book.title;
  };

  const handleReturnBook = async (dueId: string, bookId: string, fine: number = 0) => {
    try {
      setReturnLoading(true);
      
      const updatedDue = await dueService.updateDue(dueId, {
        returnDate: new Date().toISOString(),
        fineAmount: fine,
        status: fine > 0 ? 'pending' : 'paid'
      });
      
      const book = books.find(b => b.id === bookId || b._id === bookId);
      if (!book) {
        throw new Error("Book not found");
      }
      
      const updatedBook = await bookService.updateBook(bookId, {
        availableCopies: (book.availableCopies + 1),
        status: 'available'
      });
      
      if (selectedMemberId) {
        await activityLogService.addActivityLog({
          userId: selectedMemberId,
          action: 'return',
          bookId: bookId,
          details: {
            returnDate: new Date().toISOString(),
            fineAmount: fine
          }
        });
      }
      
      const updatedBooks = books.map(b => 
        (b.id === bookId || b._id === bookId) ? updatedBook : b
      );
      
      onBookReturned(updatedBooks);
      setActiveBorrowings(activeBorrowings.filter(due => due.id !== dueId && due._id !== dueId));
      
      toast({
        title: "Success",
        description: "Book has been returned successfully.",
      });
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process book return. Please try again.",
      });
    } finally {
      setReturnLoading(false);
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
      
      {selectedMemberId && (
        <div className="space-y-2 mt-4">
          <h3 className="font-medium">Active Borrowings</h3>
          
          {activeLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeBorrowings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This member has no active borrowings.
            </p>
          ) : (
            <div className="space-y-2">
              {activeBorrowings.map((due) => (
                <ActiveBorrowingItem
                  key={due.id || due._id}
                  due={due}
                  bookTitle={getBookTitle(
                    typeof due.bookId === 'string' ? due.bookId : due.bookId?.id || due.bookId?._id || ""
                  )}
                  returnLoading={returnLoading}
                  onReturnBook={handleReturnBook}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
