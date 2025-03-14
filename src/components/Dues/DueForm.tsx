
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Due, Book, Member, members, books } from "@/lib/data";

interface DueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (due: Due) => void;
  initialData?: Due;
  mode: 'create' | 'edit';
}

export function DueForm({ isOpen, onClose, onSave, initialData, mode }: DueFormProps) {
  const [formData, setFormData] = useState<Due>(
    initialData || {
      id: `d${Date.now()}`,
      memberId: "",
      bookId: "",
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: null,
      fineAmount: 0,
      status: "pending"
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
      // Only show available books for new issues
      setAvailableBooks(books.filter(book => book.status === 'available'));
    } else {
      // Show all books when editing
      setAvailableBooks(books);
    }
  }, [mode]);

  const handleChange = (field: keyof Due, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFine = (dueDate: string, returnDate: string | null): number => {
    if (!returnDate) return 0;
    
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    
    // If returned before or on due date, no fine
    if (returned <= due) return 0;
    
    // Calculate days overdue
    const daysLate = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate fine at $0.50 per day
    return daysLate * 0.5;
  };

  const handleReturnDateChange = (returnDate: string | null) => {
    handleChange('returnDate', returnDate);
    
    if (returnDate) {
      const fine = calculateFine(formData.dueDate, returnDate);
      handleChange('fineAmount', fine);
    }
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
    
    if (!formData.issueDate) {
      toast.error("Issue date is required");
      return;
    }
    
    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }
    
    // Save the due
    onSave(formData);
    onClose();
    
    // Show success toast
    toast.success(
      mode === 'create' 
        ? "Book issued successfully" 
        : "Record updated successfully"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Issue New Book' : 'Update Record'}
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
                      {member.name}
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
                      {book.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                  className="subtle-input"
                  disabled={mode === 'edit'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="subtle-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="returnDate">Return Date</Label>
                {formData.returnDate && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleReturnDateChange(null)}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate || ""}
                onChange={(e) => handleReturnDateChange(e.target.value)}
                className="subtle-input"
              />
            </div>
            
            {formData.returnDate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fineAmount">Fine Amount ($)</Label>
                  <Input
                    id="fineAmount"
                    type="number"
                    step="0.01"
                    value={formData.fineAmount}
                    onChange={(e) => handleChange('fineAmount', parseFloat(e.target.value))}
                    className="subtle-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <RadioGroup 
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value as 'pending' | 'paid' | 'waived')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pending" id="pending" />
                      <Label htmlFor="pending" className="cursor-pointer">Pending</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="paid" />
                      <Label htmlFor="paid" className="cursor-pointer">Paid</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="waived" id="waived" />
                      <Label htmlFor="waived" className="cursor-pointer">Waived</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              {mode === 'create' ? 'Issue Book' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
