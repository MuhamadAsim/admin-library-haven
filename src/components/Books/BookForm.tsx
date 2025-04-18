import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Book } from "@/lib/data";
import { addBook, updateBook } from "@/services/bookService";

interface BookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  initialData?: Book;
  mode: 'create' | 'edit';
}

export function BookForm({ isOpen, onClose, onSave, initialData, mode }: BookFormProps) {
  const [formData, setFormData] = useState<Book>(
    initialData || {
      id: `b${Date.now()}`,  // This will be ignored by MongoDB
      title: "",
      author: "",
      isbn: "",
      publishedYear: new Date().getFullYear(),
      genre: "",
      description: "",
      totalCopies: 1,
      availableCopies: 1,
      status: "available",
      coverImage: ""
    }
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form data for new books
      setFormData({
        id: `b${Date.now()}`,  // This will be ignored by MongoDB
        title: "",
        author: "",
        isbn: "",
        publishedYear: new Date().getFullYear(),
        genre: "",
        description: "",
        totalCopies: 1,
        availableCopies: 1,
        status: "available",
        coverImage: ""
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof Book, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.title) {
      toast.error("Title is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.author) {
      toast.error("Author is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.isbn) {
      toast.error("ISBN is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.publishedYear) {
      toast.error("Published Year is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.genre) {
      toast.error("Genre is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.description) {
      toast.error("Description is required");
      setIsSubmitting(false);
      return;
    }

    if (!formData.totalCopies || formData.totalCopies <= 0) {
      toast.error("Total Copies must be greater than 0");
      setIsSubmitting(false);
      return;
    }

    if (!formData.availableCopies || formData.availableCopies < 0) {
      toast.error("Available Copies cannot be negative");
      setIsSubmitting(false);
      return;
    }

    if (formData.availableCopies > formData.totalCopies) {
      toast.error("Available Copies cannot be greater than Total Copies");
      setIsSubmitting(false);
      return;
    }

    try {
      let savedBook;
      
      if (mode === 'create') {
        // For create mode, use addBook service
        const { id, ...bookWithoutId } = formData; // Remove client-side id
        savedBook = await addBook(bookWithoutId);
      } else {
        // For edit mode, use updateBook service
        const bookId = initialData?._id || initialData?.id;
        if (!bookId) {
          throw new Error("Book ID is missing for update");
        }
        savedBook = await updateBook(bookId, formData);
      }
      
      // Map MongoDB _id to id if needed
      const finalBook = {
        ...savedBook,
        id: savedBook._id || savedBook.id
      };
      
      onSave(finalBook);
      onClose();

      // Show success toast
      toast.success(
        mode === 'create'
          ? "Book added successfully"
          : "Book updated successfully"
      );
      
    } catch (error) {
      console.error("Error saving book:", error);
      toast.error(`Failed to ${mode === 'create' ? 'add' : 'update'} book`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto my-1 py-2">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2 py-2 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="subtle-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                type="text"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                className="subtle-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                type="text"
                value={formData.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                className="subtle-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year</Label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => handleChange('publishedYear', parseInt(e.target.value))}
                className="subtle-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                type="text"
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                className="subtle-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="subtle-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCopies">Total Copies</Label>
                <Input
                  id="totalCopies"
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => handleChange('totalCopies', parseInt(e.target.value))}
                  className="subtle-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableCopies">Available Copies</Label>
                <Input
                  id="availableCopies"
                  type="number"
                  value={formData.availableCopies}
                  onChange={(e) => handleChange('availableCopies', parseInt(e.target.value))}
                  className="subtle-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="text"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                className="subtle-input"
              />
            </div>
          </div>

          <DialogFooter className="px-2 py-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              {mode === 'create' ? 'Add Book' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
