
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-5 w-5 text-muted-foreground" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => {
          setTheme(checked ? "dark" : "light");
        }}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
