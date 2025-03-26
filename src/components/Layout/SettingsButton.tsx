
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { EmailConfig } from "@/components/Settings/EmailConfig";
import { Settings } from "lucide-react";

export default function SettingsButton() {
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setIsEmailConfigOpen(true)}
        className="text-muted-foreground hover:text-foreground"
        title="Email Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
      
      <EmailConfig 
        isOpen={isEmailConfigOpen}
        onClose={() => setIsEmailConfigOpen(false)}
      />
    </>
  );
}
