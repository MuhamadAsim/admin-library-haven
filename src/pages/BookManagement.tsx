
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, RefreshCw, Loader2 } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Book, Member, Due } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as memberService from "@/services/memberService";
import * as dueService from "@/services/dueService";
import * as activityLogService from "@/services/activityLogService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookManagementSearch } from "@/components/Books/BookManagementSearch";

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [activeBorrowings, setActiveBorrowings] = useState<Due[]>([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [issuanceLoading, setIssuanceLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setBooksLoading(true);
        setMembersLoading(true);
        
        const fetchedBooks = await bookService.getBooks();
        const fetchedMembers = await memberService.getMembers();
        
        setBooks(fetchedBooks);
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
        });
      } finally {
        setBooksLoading(false);
        setMembersLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

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
      
      setBooks(books.map(b => 
        (b.id === selectedBookId || b._id === selectedBookId) ? updatedBook : b
      ));
      
      setSelectedBookId("");
      
      const allDues = await dueService.getDues();
      const memberDues = allDues.filter(due => 
        (due.memberId && due.memberId === selectedMemberId) || 
        (due.memberId && typeof due.memberId === 'object' && due.memberId._id === selectedMemberId) ||
        (due.memberId && typeof due.memberId === 'object' && due.memberId.id === selectedMemberId)
      ).filter(due => !due.returnDate);
      setActiveBorrowings(memberDues);
      
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
      
      setBooks(books.map(b => 
        (b.id === bookId || b._id === bookId) ? updatedBook : b
      ));
      
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

  const getBookTitle = (bookId: string) => {
    if (!bookId) return "Unknown Book";
    
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return "Unknown Book";
    
    return book.title;
  };

  const calculateFine = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    
    if (due >= today) return 0;
    
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysOverdue;
  };

  const availableBooks = books.filter(book => book.availableCopies > 0);

  const membersForSearch = members.map(member => ({
    id: member.id || member._id || "",
    _id: member._id,
    label: member.name,
    description: member.email
  }));

  const booksForSearch = availableBooks.map(book => ({
    id: book.id || book._id || "",
    _id: book._id,
    label: book.title,
    description: `by ${book.author} (Copies: ${book.availableCopies})`
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Book Management</h2>
        
        <Tabs defaultValue="issue">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issue">Issue Books</TabsTrigger>
            <TabsTrigger value="return">Return Books</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issue" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue a Book to Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="return" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Books</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        {activeBorrowings.map((due) => {
                          const bookId = due.bookId ? (
                            typeof due.bookId === 'string' ? 
                              due.bookId : (due.bookId.id || due.bookId._id || "")
                          ) : "";
                          
                          if (!bookId) return null;
                          
                          const dueDate = new Date(due.dueDate);
                          const isOverdue = dueDate < new Date();
                          const fine = calculateFine(due.dueDate);
                          
                          return (
                            <div 
                              key={due.id || due._id} 
                              className="border rounded-lg p-4 space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{getBookTitle(bookId)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Due by: {new Date(due.dueDate).toLocaleDateString()}
                                  </p>
                                  {isOverdue && (
                                    <p className="text-sm text-red-500">
                                      Overdue by {Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                    </p>
                                  )}
                                  {fine > 0 && (
                                    <p className="text-sm font-semibold text-red-500">
                                      Fine: ${fine.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Return
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirm Book Return</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <p>Book: <strong>{getBookTitle(bookId)}</strong></p>
                                      {fine > 0 ? (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                          <p className="font-medium text-red-600 dark:text-red-400">
                                            This book is overdue by {Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                          </p>
                                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                            Fine amount: ${fine.toFixed(2)}
                                          </p>
                                        </div>
                                      ) : (
                                        <p className="mt-2 text-green-600 dark:text-green-400">
                                          This book is being returned on time. No fine.
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="outline" 
                                        onClick={() => handleReturnBook(due.id || due._id || "", bookId, fine)}
                                        disabled={returnLoading}
                                      >
                                        {returnLoading ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                          </>
                                        ) : (
                                          "Confirm Return"
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
