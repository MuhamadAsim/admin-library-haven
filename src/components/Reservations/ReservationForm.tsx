
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Reservation, Book, Member, members, books } from "@/lib/data";

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservation: Reservation) => void;
  initialData?: Reservation;
  mode: 'create' | 'edit';
}

export function ReservationForm({ isOpen, onClose, onSave, initialData, mode }: ReservationFormProps) {
  const [formData, setFormData] = useState<Reservation>(
    initialData || {
      id: `r${Date.now()}`,
      memberId: "",
      bookId: "",
      reservationDate: new Date().toISOString().split('T')[0],
      status: "pending",
      notificationSent: false
    }
  );
  
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);

  // Load available members and books
  useEffect(() => {
    // For members, only show active members
    setAvailableMembers(members.filter(member => member.status === 'active'));
    
    // For books, filter based on mode
    if (mode === 'create') {
      // Only show books with no available copies (need reservation)
      setAvailableBooks(books.filter(book => book.availableCopies === 0));
    } else {
      // Show all books when editing
      setAvailableBooks(books);
    }
  }, [mode]);

  const handleChange = (field: keyof Reservation, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.memberId) {
      toast.error("Please select a member");
      return;
    }
    
    if (!formData.bookId) {
      toast.error("Please select a book");
      return;
    }
    
    // Save the reservation
    onSave(formData);
    onClose();
    
    // Show success toast
    toast.success(
      mode === 'create' 
        ? "Book reserved successfully" 
        : "Reservation updated successfully"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Reserve Book' : 'Update Reservation'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member</Label>
              <Select 
                value={formData.memberId} 
                onValueChange={(value) => handleChange('memberId', value)}
                disabled={mode === 'edit'}
              >
                <SelectTrigger id="memberId" className="subtle-input">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bookId">Book</Label>
              <Select 
                value={formData.bookId} 
                onValueChange={(value) => handleChange('bookId', value)}
                disabled={mode === 'edit'}
              >
                <SelectTrigger id="bookId" className="subtle-input">
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.availableCopies === 0 ? 'Not Available' : `${book.availableCopies} copies available`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {mode === 'edit' && (
              <div className="space-y-2">
                <Label>Reservation Status</Label>
                <RadioGroup 
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as 'pending' | 'fulfilled' | 'cancelled')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="cursor-pointer">Pending</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fulfilled" id="fulfilled" />
                    <Label htmlFor="fulfilled" className="cursor-pointer">Fulfilled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancelled" id="cancelled" />
                    <Label htmlFor="cancelled" className="cursor-pointer">Cancelled</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              {mode === 'create' ? 'Reserve Book' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
