
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/lib/data";
import { getBooks } from "@/services/bookService";
import { reserveBook } from "@/services/reservationService";
import { authService } from "@/services/authService";

interface BookDisplay {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
  cover?: string;
}

export default function MemberBooks() {
  const [books, setBooks] = useState<BookDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const fetchedBooks = await getBooks();
        
        const displayBooks: BookDisplay[] = fetchedBooks.map(book => ({
          id: book.id || book._id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          available: book.status === 'available' && book.availableCopies > 0,
          cover: book.coverImage
        }));
        
        setBooks(displayBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast({
          title: "Error",
          description: "Failed to load books. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, [toast]);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReserve = async (book: BookDisplay) => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to reserve books.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsReserving(book.id);
      await reserveBook(book.id, user.id);
      
      toast({
        title: "Book Reserved",
        description: `You have successfully reserved "${book.title}". We'll notify you when it's available.`,
      });
    } catch (error: any) {
      console.error("Error reserving book:", error);
      let errorMessage = "Failed to reserve book. Please try again.";
      
      // If the API returns a specific error message
      if (error.response && error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg;
      }
      
      toast({
        title: "Reservation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsReserving(null);
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Library Books</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted rounded-t-lg" />
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3 mb-4" />
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No books available</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  There are currently no books in the library catalog.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="h-32 bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/60" />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                      <div className="text-sm text-muted-foreground">by {book.author}</div>
                      <Badge variant="outline" className="mt-1 w-fit">
                        {book.genre}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={book.available ? "bg-green-500" : "bg-red-500"}>
                          {book.available ? "Available" : "Unavailable"}
                        </Badge>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReserve(book)}
                            disabled={isReserving === book.id}
                          >
                            Reserve
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        <p>Visit the library to check out books.</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MemberLayout>
  );
}
