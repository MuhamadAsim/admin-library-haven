
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-5 w-5 text-muted-foreground" />
      <Toggle
        pressed={theme === "dark"}
        onPressedChange={(pressed) => {
          setTheme(pressed ? "dark" : "light");
        }}
        aria-label="Toggle dark mode"
      >
        <span className="sr-only">Toggle dark mode</span>
      </Toggle>
      <Moon className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
