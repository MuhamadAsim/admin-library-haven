import { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { DataTable, Column } from "@/components/ui/DataTable";
import { BookForm } from "@/components/Books/BookForm";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, BookOpen } from "lucide-react";
import { Book } from "@/lib/data";
import { getBooks, addBook, updateBook, deleteBook } from "@/services/bookService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const data = await getBooks();
      const formattedBooks = data.map((book: any) => ({
        ...book,
        id: book._id || book.id
      }));
      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBook = async (book: Book) => {
    try {
      if (isEditDialogOpen && selectedBook) {
        const bookId = selectedBook._id || selectedBook.id;
        const updatedBook = await updateBook(bookId, book);
        setBooks(books.map((b) => (b.id === bookId ? { ...updatedBook, id: updatedBook._id || updatedBook.id } : b)));
        toast.success("Book updated successfully");
      } else {
        await fetchBooks();
        toast.success("Book added successfully");
      }
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error(`Failed to ${isEditDialogOpen ? 'update' : 'add'} book`);
    } finally {
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setSelectedBook(null);
    }
  };

  const handleDeleteBook = async () => {
    if (selectedBook) {
      try {
        const bookId = selectedBook._id || selectedBook.id;
        await deleteBook(bookId);
        setBooks(books.filter((b) => b.id !== bookId));
        toast.success("Book deleted successfully");
      } catch (error) {
        console.error("Error deleting book:", error);
        toast.error("Failed to delete book");
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedBook(null);
      }
    }
  };

  const columns: Column<Book>[] = [
    {
      header: "Title",
      accessorKey: "title",
      enableSorting: true,
      cell: (book) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md overflow-hidden mr-3 bg-primary/10">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <div className="font-medium">{book.title}</div>
        </div>
      ),
    },
    {
      header: "Author",
      accessorKey: "author",
      enableSorting: true,
    },
    {
      header: "ISBN",
      accessorKey: "isbn",
    },
    {
      header: "Published",
      accessorKey: "publishedYear",
      enableSorting: true,
    },
    {
      header: "Genre",
      accessorKey: "genre",
    },
    {
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      cell: (book) => {
        const statusConfig = {
          available: { label: "Available", classes: "bg-green-100 text-green-800 hover:bg-green-200" },
          borrowed: { label: "Borrowed", classes: "bg-amber-100 text-amber-800 hover:bg-amber-200" },
          reserved: { label: "Reserved", classes: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
          maintenance: { label: "Maintenance", classes: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
        };
        
        const config = statusConfig[book.status];
        
        return (
          <Badge variant="outline" className={cn("font-normal", config.classes)}>
            {config.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Books</h1>
            <p className="text-muted-foreground">
              Manage your library book collection.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>

        <DataTable
          data={books}
          columns={columns}
          onEdit={(book) => {
            setSelectedBook(book);
            setIsEditDialogOpen(true);
          }}
          onDelete={(book) => {
            setSelectedBook(book);
            setIsDeleteDialogOpen(true);
          }}
          onView={(book) => {
            setSelectedBook(book);
            setIsViewDialogOpen(true);
          }}
          isLoading={isLoading}
        />

        <BookForm
          isOpen={isAddDialogOpen || isEditDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedBook(null);
          }}
          onSave={handleSaveBook}
          initialData={selectedBook || undefined}
          mode={isEditDialogOpen ? "edit" : "create"}
        />

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="glass-panel max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Book Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedBook && (
              <div className="space-y-6 py-4">
                <div className="flex items-start space-x-4">
                  <div className="h-24 w-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    {selectedBook.coverImage ? (
                      <img 
                        src={selectedBook.coverImage} 
                        alt={selectedBook.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedBook.title}</h3>
                    <p className="text-sm text-muted-foreground">by {selectedBook.author}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className={cn(
                        "font-normal",
                        selectedBook.status === "available" && "bg-green-100 text-green-800",
                        selectedBook.status === "borrowed" && "bg-amber-100 text-amber-800",
                        selectedBook.status === "reserved" && "bg-blue-100 text-blue-800",
                        selectedBook.status === "maintenance" && "bg-gray-100 text-gray-800",
                      )}>
                        {selectedBook.status.charAt(0).toUpperCase() + selectedBook.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">ISBN</p>
                      <p className="font-medium">{selectedBook.isbn}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Published</p>
                      <p className="font-medium">{selectedBook.publishedYear}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Genre</p>
                      <p className="font-medium">{selectedBook.genre}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-1 text-sm">Description</p>
                    <p className="text-sm">{selectedBook.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit Book
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the book "
                {selectedBook?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedBook(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBook}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Books;
