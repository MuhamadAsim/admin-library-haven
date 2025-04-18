
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Due, Book, Member, MemberReference, BookReference } from "@/types";
import { getMembers } from "@/services/memberService";
import { getBooks } from "@/services/bookService";
import { extractMemberId, extractBookId } from "@/utils/referenceHelpers";
import { BookManagementSearch } from "../Books/BookManagementSearch";

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
      memberId: "" as MemberReference,
      bookId: "" as BookReference,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: null,
      fineAmount: 0,
      status: "pending"
    }
  );
  
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const members = await getMembers();
        // Ensure members have valid properties before filtering
        const validMembers = Array.isArray(members) ? 
          members.filter(member => member && typeof member === 'object') : [];
          
        setAvailableMembers(validMembers.filter(member => member.status === 'active'));
        
        const books = await getBooks();
        // Ensure books have valid properties before filtering
        const validBooks = Array.isArray(books) ? 
          books.filter(book => book && typeof book === 'object') : [];
          
        if (mode === 'create') {
          setAvailableBooks(validBooks.filter(book => book.status === 'available'));
        } else {
          setAvailableBooks(validBooks);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [mode]);

  const handleChange = (field: keyof Due, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateFine = (dueDate: string, returnDate: string | null): number => {
    if (!returnDate) return 0;
    
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    
    if (returned <= due) return 0;
    
    const daysLate = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLate * 0.5;
  };

  const handleReturnDateChange = (returnDate: string | null) => {
    handleChange('returnDate', returnDate);
    
    if (returnDate) {
      const fine = calculateFine(formData.dueDate, returnDate);
      handleChange('fineAmount', fine);
    }
  };

  const handleSelectMember = (id: string) => {
    handleChange('memberId', id);
  };

  const handleSelectBook = (id: string) => {
    handleChange('bookId', id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    onSave(formData);
  };
  
  // Ensure we have valid member and book data for the search components
  const memberItems = Array.isArray(availableMembers) ? 
    availableMembers
      .filter(member => member && typeof member === 'object' && (member.id || member._id))
      .map(member => ({
        id: member.id || member._id || "",
        label: member.name || "Unknown member",
        description: member.email || ""
      })) : [];

  const bookItems = Array.isArray(availableBooks) ? 
    availableBooks
      .filter(book => book && typeof book === 'object' && (book.id || book._id))
      .map(book => ({
        id: book.id || book._id || "",
        label: book.title || "Unknown book",
        description: book.author || ""
      })) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Issue New Book' : 'Update Record'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Select a member and book to issue' 
              : 'Update the borrowing record details'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <BookManagementSearch
                items={memberItems}
                selectedId={extractMemberId(formData.memberId)}
                onSelect={handleSelectMember}
                placeholder="Select member"
                label="Member"
                isLoading={isLoading}
                disabled={mode === 'edit'}
                emptyMessage="No members found"
              />
            </div>
            
            <div className="space-y-2">
              <BookManagementSearch
                items={bookItems}
                selectedId={extractBookId(formData.bookId)}
                onSelect={handleSelectBook}
                placeholder="Select book"
                label="Book"
                isLoading={isLoading}
                disabled={mode === 'edit'}
                emptyMessage="No books available"
              />
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
