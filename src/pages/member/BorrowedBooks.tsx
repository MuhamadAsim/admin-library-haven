
import { useState, useEffect } from "react";
import { format, isPast } from "date-fns";
import { Book, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { getDuesByMemberId, updateDue } from "@/services/dueService";
import { Due } from "@/lib/data";
import { ActiveBorrowingItem } from "@/components/Books/ActiveBorrowingItem";

export default function MemberBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<Due[]>([]);
  const [returnedBooks, setReturnedBooks] = useState<Due[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(false);
  const { toast } = useToast();

  const fetchBorrowedBooks = async () => {
    try {
      setIsLoading(true);
      const user = authService.getCurrentUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You need to be logged in to view your borrowed books.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Fetching borrowed books for user:", user.id);
      const dues = await getDuesByMemberId(user.id);
      console.log("Retrieved dues:", dues);
      
      // Separate current borrowings and returned books
      const current = dues.filter(due => !due.returnDate);
      const returned = dues.filter(due => due.returnDate);
      
      setBorrowedBooks(current);
      setReturnedBooks(returned);
    } catch (error) {
      console.error("Error fetching borrowed books:", error);
      toast({
        title: "Error",
        description: "Failed to load your borrowed books. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [toast]);

  const handleReturnBook = async (dueId: string, bookId: string, fine: number) => {
    try {
      setReturnLoading(true);
      
      await updateDue(dueId, {
        returnDate: new Date().toISOString(),
        fineAmount: fine,
        status: fine > 0 ? 'pending' : 'paid'
      });
      
      toast({
        title: "Success",
        description: "Book returned successfully."
      });
      
      // Refresh the list
      fetchBorrowedBooks();
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        title: "Error",
        description: "Failed to return book. Please try again.",
        variant: "destructive"
      });
    } finally {
      setReturnLoading(false);
    }
  };

  const getBookTitle = (bookId: any): string => {
    if (typeof bookId === 'object' && bookId) {
      return bookId.title || 'Unknown Book';
    }
    return 'Unknown Book';
  };

  const getBookAuthor = (bookId: any): string => {
    if (typeof bookId === 'object' && bookId) {
      return bookId.author || '';
    }
    return '';
  };

  const getBookCover = (bookId: any): string => {
    if (typeof bookId === 'object' && bookId) {
      return bookId.coverImage || 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2788&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2788&auto=format&fit=crop';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const isOverdue = (dueDate: string) => {
    return isPast(new Date(dueDate)) && new Date(dueDate).getTime() < Date.now();
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">My Borrowed Books</h2>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full md:w-80 grid-cols-2">
            <TabsTrigger value="current">Currently Borrowed</TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="mt-6 text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2">Loading your books...</p>
            </div>
          ) : (
            <>
              <TabsContent value="current" className="mt-6">
                {borrowedBooks.length === 0 ? (
                  <div className="text-center py-10 bg-muted/10 rounded-lg">
                    <Book className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No books currently borrowed</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You don't have any books checked out at the moment.
                    </p>
                    <Button className="mt-4" variant="outline" asChild>
                      <a href="/member/books">Browse Available Books</a>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {borrowedBooks.map((due) => (
                      <ActiveBorrowingItem
                        key={due.id || due._id}
                        due={due}
                        bookTitle={getBookTitle(due.bookId)}
                        returnLoading={returnLoading}
                        onReturnBook={handleReturnBook}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                {returnedBooks.length === 0 ? (
                  <div className="text-center py-10 bg-muted/10 rounded-lg">
                    <Book className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No borrowing history</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You haven't borrowed any books in the past.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {returnedBooks.map((due) => (
                      <Card key={due.id || due._id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="line-clamp-1">{getBookTitle(due.bookId)}</CardTitle>
                          <p className="text-sm text-muted-foreground">by {getBookAuthor(due.bookId)}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>Borrowed:</span>
                              </div>
                              <span className="text-sm font-medium">{formatDate(due.issueDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm">
                                <Clock className="mr-1 h-4 w-4" />
                                <span>Returned:</span>
                              </div>
                              <span className="text-sm font-medium">{formatDate(due.returnDate || '')}</span>
                            </div>
                            
                            <div className="mt-4 flex items-center">
                              <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                              <span className="text-sm">
                                {due.status === 'paid' && due.fineAmount > 0 ? 
                                  `Fine paid: $${due.fineAmount.toFixed(2)}` : 
                                  'Returned on time'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MemberLayout>
  );
}
