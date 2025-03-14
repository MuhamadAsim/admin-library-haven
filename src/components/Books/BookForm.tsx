
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Book } from "@/lib/data";

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
      id: `b${Date.now()}`,
      title: "",
      author: "",
      isbn: "",
      publishedYear: new Date().getFullYear(),
      genre: "",
      description: "",
      status: "available",
      coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop"
    }
  );

  const handleChange = (field: keyof Book, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error("Book title is required");
      return;
    }
    
    if (!formData.author.trim()) {
      toast.error("Author is required");
      return;
    }
    
    if (!formData.isbn.trim()) {
      toast.error("ISBN is required");
      return;
    }
    
    // Save the book
    onSave(formData);
    onClose();
    
    // Show success toast
    toast.success(
      mode === 'create' 
        ? "Book added successfully" 
        : "Book updated successfully"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Book Title"
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Author Name"
                className="subtle-input"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  placeholder="9781234567890"
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
                  placeholder="2023"
                  className="subtle-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                placeholder="Fiction, Non-fiction, etc."
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the book..."
                className="subtle-input resize-none"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage}
                onChange={(e) => handleChange('coverImage', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value as 'available' | 'borrowed' | 'reserved' | 'maintenance')}
              >
                <SelectTrigger id="status" className="subtle-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
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
