
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Check } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  available: boolean;
  cover?: string;
}

export default function MemberBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // In a real app, you would fetch from your API
        // For demo, we'll use some sample data
        const sampleBooks: Book[] = [
          {
            id: "1",
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            genre: "Fiction",
            available: true,
          },
          {
            id: "2",
            title: "1984",
            author: "George Orwell",
            genre: "Science Fiction",
            available: false,
          },
          {
            id: "3",
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            genre: "Fiction",
            available: true,
          },
          {
            id: "4",
            title: "Pride and Prejudice",
            author: "Jane Austen",
            genre: "Romance",
            available: true,
          },
          {
            id: "5",
            title: "The Catcher in the Rye",
            author: "J.D. Salinger",
            genre: "Fiction",
            available: false,
          },
          {
            id: "6",
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            genre: "Fantasy",
            available: true,
          },
        ];
        
        setBooks(sampleBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBorrow = (book: Book) => {
    toast({
      title: "Book Borrowed",
      description: `You have successfully borrowed "${book.title}"`,
    });
  };

  const handleReserve = (book: Book) => {
    toast({
      title: "Book Reserved",
      description: `You have successfully reserved "${book.title}". We'll notify you when it's available.`,
    });
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
                <h3 className="mt-4 text-lg font-medium">No books found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn't find any books matching your search.
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
                          {book.available ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleBorrow(book)}
                            >
                              Borrow
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReserve(book)}
                            >
                              Reserve
                            </Button>
                          )}
                        </div>
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
