
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Book, User, CreditCard, Bell, LogOut, Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUser();

  // Navigation items for member panel
  const navItems = [
    { name: "Dashboard", href: "/member/dashboard", icon: Home },
    { name: "Books", href: "/member/books", icon: Book },
    { name: "Reservations", href: "/member/reservations", icon: User },
    { name: "Dues", href: "/member/dues", icon: CreditCard },
    { name: "Notifications", href: "/member/notifications", icon: Bell },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card border-r">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-card border-b">
            <h1 className="text-xl font-semibold text-primary">Library System</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.email.charAt(0).toUpperCase() || 'M'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">{user?.email || 'Member'}</p>
                <p className="text-xs text-muted-foreground">Member Account</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
              <div className="flex justify-center mt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-card shadow-lg transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-lg font-semibold text-primary">Library System</h1>
            <button
              type="button"
              className="-mr-2 inline-flex items-center justify-center p-2 rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-base font-medium rounded-md",
                    location.pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="mt-10 px-2">
              <div className="pt-2 space-y-1 border-t">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
                <div className="flex justify-center mt-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-10 md:hidden flex items-center justify-between px-4 py-2 bg-card border-b h-16">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-foreground hover:text-primary"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-primary">Library System</h1>
        </div>
        <div className="h-12 w-12 flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
