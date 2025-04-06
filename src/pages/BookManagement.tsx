
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, RefreshCw, Loader2, Search } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import { useToast } from "@/hooks/use-toast";
import { Book, Member, Due } from "@/lib/data";
import * as bookService from "@/services/bookService";
import * as memberService from "@/services/memberService";
import * as dueService from "@/services/dueService";
import * as activityLogService from "@/services/activityLogService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [openMemberPopover, setOpenMemberPopover] = useState(false);
  const [openBookPopover, setOpenBookPopover] = useState(false);
  
  const { toast } = useToast();

  // Fetch books and members on component mount
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

  // Fetch active borrowings when a member is selected
  useEffect(() => {
    const fetchActiveBorrowings = async () => {
      if (!selectedMemberId) {
        setActiveBorrowings([]);
        return;
      }
      
      try {
        setActiveLoading(true);
        const allDues = await dueService.getDues();
        const memberDues = allDues.filter(due => 
          (due.memberId && due.memberId === selectedMemberId) || 
          (due.memberId && typeof due.memberId === 'object' && due.memberId._id === selectedMemberId) ||
          (due.memberId && typeof due.memberId === 'object' && due.memberId.id === selectedMemberId)
        ).filter(due => !due.returnDate);
        
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

  // Handle issuing a book
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
      
      // Check if book is available
      const book = books.find(b => b.id === selectedBookId || b._id === selectedBookId);
      if (!book || (book.availableCopies <= 0)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This book is not available for borrowing.",
        });
        return;
      }
      
      // Create due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      // Create due record
      const dueRecord = await dueService.addDue({
        memberId: selectedMemberId,
        bookId: selectedBookId,
        issueDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        fineAmount: 0,
        status: 'pending'
      });
      
      // Create activity log
      await activityLogService.addActivityLog({
        userId: selectedMemberId,
        action: 'borrow',
        bookId: selectedBookId,
        details: {
          dueDate: dueDate.toISOString(),
          issueDate: new Date().toISOString()
        }
      });
      
      // Update book copies
      const updatedBook = await bookService.updateBook(selectedBookId, {
        availableCopies: (book.availableCopies - 1),
        status: book.availableCopies <= 1 ? 'borrowed' : 'available'
      });
      
      // Update books list
      setBooks(books.map(b => 
        (b.id === selectedBookId || b._id === selectedBookId) ? updatedBook : b
      ));
      
      // Reset selection
      setSelectedBookId("");
      
      // Refresh active borrowings
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

  // Handle returning a book
  const handleReturnBook = async (dueId: string, bookId: string, fine: number = 0) => {
    try {
      setReturnLoading(true);
      
      // Update due record
      const updatedDue = await dueService.updateDue(dueId, {
        returnDate: new Date().toISOString(),
        fineAmount: fine,
        status: fine > 0 ? 'pending' : 'paid'
      });
      
      // Get the book
      const book = books.find(b => b.id === bookId || b._id === bookId);
      if (!book) {
        throw new Error("Book not found");
      }
      
      // Update book copies
      const updatedBook = await bookService.updateBook(bookId, {
        availableCopies: (book.availableCopies + 1),
        status: 'available'
      });
      
      // Create activity log
      await activityLogService.addActivityLog({
        userId: selectedMemberId,
        action: 'return',
        bookId: bookId,
        details: {
          returnDate: new Date().toISOString(),
          fineAmount: fine
        }
      });
      
      // Update books list
      setBooks(books.map(b => 
        (b.id === bookId || b._id === bookId) ? updatedBook : b
      ));
      
      // Update active borrowings
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

  // Get book title by ID
  const getBookTitle = (bookId: string) => {
    if (!bookId) return "Unknown Book";
    
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return "Unknown Book";
    
    return book.title;
  };

  // Calculate fine if book is overdue
  const calculateFine = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    
    // If not overdue, no fine
    if (due >= today) return 0;
    
    // Calculate days overdue
    const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    // $1 per day overdue
    return daysOverdue;
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Filter available books based on search term
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) && 
    book.availableCopies > 0
  );

  // Get member name by ID
  const getMemberName = (memberId: string) => {
    if (!memberId) return "";
    
    const member = members.find(m => m.id === memberId || m._id === memberId);
    return member ? member.name : "";
  };

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
                <div className="space-y-2">
                  <Label htmlFor="member-select">Select Member</Label>
                  <Popover open={openMemberPopover} onOpenChange={setOpenMemberPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMemberPopover}
                        className="w-full justify-between"
                      >
                        {selectedMemberId
                          ? getMemberName(selectedMemberId)
                          : "Search for a member..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search members..."
                          value={memberSearchTerm}
                          onValueChange={setMemberSearchTerm}
                        />
                        {membersLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No members found.</CommandEmpty>
                            <CommandGroup>
                              {filteredMembers.map((member) => (
                                <CommandItem
                                  key={member.id || member._id}
                                  value={member.name}
                                  onSelect={() => {
                                    setSelectedMemberId(member.id || member._id || "");
                                    setMemberSearchTerm("");
                                    setOpenMemberPopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (member.id === selectedMemberId || 
                                       member._id === selectedMemberId)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="book-select">Select Book</Label>
                  <Popover open={openBookPopover} onOpenChange={setOpenBookPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBookPopover}
                        className="w-full justify-between"
                        disabled={!selectedMemberId}
                      >
                        {selectedBookId
                          ? getBookTitle(selectedBookId)
                          : "Search for a book..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search books..."
                          value={bookSearchTerm}
                          onValueChange={setBookSearchTerm}
                        />
                        {booksLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No available books found.</CommandEmpty>
                            <CommandGroup>
                              {filteredBooks.map((book) => (
                                <CommandItem
                                  key={book.id || book._id}
                                  value={book.title}
                                  onSelect={() => {
                                    setSelectedBookId(book.id || book._id || "");
                                    setBookSearchTerm("");
                                    setOpenBookPopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (book.id === selectedBookId || 
                                       book._id === selectedBookId)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {book.title} (Copies: {book.availableCopies})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
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
                <div className="space-y-2">
                  <Label htmlFor="member-select-return">Select Member</Label>
                  <Popover open={openMemberPopover} onOpenChange={setOpenMemberPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openMemberPopover}
                        className="w-full justify-between"
                      >
                        {selectedMemberId
                          ? getMemberName(selectedMemberId)
                          : "Search for a member..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search members..."
                          value={memberSearchTerm}
                          onValueChange={setMemberSearchTerm}
                        />
                        {membersLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No members found.</CommandEmpty>
                            <CommandGroup>
                              {filteredMembers.map((member) => (
                                <CommandItem
                                  key={member.id || member._id}
                                  value={member.name}
                                  onSelect={() => {
                                    setSelectedMemberId(member.id || member._id || "");
                                    setMemberSearchTerm("");
                                    setOpenMemberPopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (member.id === selectedMemberId || 
                                       member._id === selectedMemberId)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
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
                          const bookId = due.bookId && typeof due.bookId === 'object' ? 
                            (due.bookId.id || due.bookId._id) : due.bookId;
                          
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
