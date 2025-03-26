
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EmailConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfig({ isOpen, onClose }: EmailConfigProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    serviceId: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, this would call the Electron API to save the config
      if (window.electron) {
        await window.electron.saveEmailConfig(formData);
        toast.success("Email configuration saved successfully");
        onClose();
      } else {
        // Fallback if not running in Electron
        console.log('Email config (would be saved if running in Electron):', formData);
        toast.success("Email configuration saved (simulation mode)");
        onClose();
      }
    } catch (error) {
      console.error('Error saving email config:', error);
      toast.error("Failed to save email configuration");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Email Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="subtle-input"
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Email Password or App Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="subtle-input"
                placeholder="Enter your email password"
              />
              <p className="text-xs text-muted-foreground">
                For Gmail, use an app password. Never enter your actual Gmail password.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceId">EmailJS Service ID</Label>
              <Input
                id="serviceId"
                type="text"
                value={formData.serviceId}
                onChange={(e) => handleChange('serviceId', e.target.value)}
                className="subtle-input"
                placeholder="Enter your EmailJS service ID"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="ml-2">
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
