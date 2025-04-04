
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Member } from "@/lib/data";
import api from "@/services/api";

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => Promise<Member | void>;
  initialData?: Member;
  mode: 'create' | 'edit';
}

export function MemberForm({ isOpen, onClose, onSave, initialData, mode }: MemberFormProps) {
  const [formData, setFormData] = useState<Member>(
    initialData || {
      id: `m${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      address: "",
      membershipDate: new Date().toISOString().split('T')[0],
      status: "active"
    }
  );
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Convert MongoDB ISO date to YYYY-MM-DD for date input
      const membershipDate = initialData.membershipDate ? 
        new Date(initialData.membershipDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
        
      setFormData({
        ...initialData,
        membershipDate
      });
      
      // Reset passwords when editing
      setPassword("");
      setConfirmPassword("");
    }
  }, [initialData]);

  const handleChange = (field: keyof Member, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error("Member name is required");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    // Additional validation for password when creating a new member
    if (mode === 'create') {
      if (!password) {
        toast.error("Password is required");
        return;
      }
      
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    try {
      // Save the member first
      const savedMember = await onSave(formData);
      
      // If creating a new member, also create a user account
      if (mode === 'create' && savedMember && savedMember._id) {
        try {
          // Register user with the member ID
          await api.post('/auth/register', {
            email: formData.email,
            password: password,
            memberId: savedMember._id
          });
          
          toast.success("Member account created successfully");
        } catch (error: any) {
          toast.error(error.response?.data?.msg || "Failed to create member account");
          // The member was created but user account failed - admin can try again later
        }
      }
      
      onClose();
    } catch (error) {
      toast.error("An error occurred while saving the member");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Add New Member' : 'Edit Member'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Smith"
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className="subtle-input"
              />
            </div>
            
            {mode === 'create' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="subtle-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="subtle-input"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="555-123-4567"
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, Anytown, USA"
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="membershipDate">Membership Date</Label>
              <Input
                id="membershipDate"
                type="date"
                value={formData.membershipDate}
                onChange={(e) => handleChange('membershipDate', e.target.value)}
                className="subtle-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value as 'active' | 'inactive' | 'suspended')}
              >
                <SelectTrigger id="status" className="subtle-input">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              {mode === 'create' ? 'Add Member' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
