import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { Book, User, CreditCard, BarChart3, Settings, Menu, X, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Members", href: "/members", icon: User },
    { name: "Books", href: "/books", icon: Book },
    { name: "Book Management", href: "/book-management", icon: BookOpen },
    { name: "Dues", href: "/dues", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="hidden md:flex">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-xl font-semibold text-primary">LibraryAdmin</h1>
            </div>
            <SidebarContent className="flex-1 py-4">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "nav-link",
                      location.pathname === item.href && "active"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                ))}
              </nav>
            </SidebarContent>
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@library.com</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </Sidebar>

        <div 
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className={cn(
              "fixed inset-y-0 left-0 w-full max-w-xs bg-background p-4 shadow-lg transition-transform duration-300 ease-in-out",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-semibold text-primary">LibraryAdmin</h1>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "nav-link",
                    location.pathname === item.href && "active"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  A
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@library.com</p>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start mb-2" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="sticky top-0 z-30 flex items-center justify-between bg-background/95 backdrop-blur-sm border-b px-4 h-14">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex-1 md:ml-4">
              <h2 className="text-lg font-medium">
                {navItems.find(item => item.href === location.pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div>
              <Button variant="ghost" size="sm">
                Help
              </Button>
            </div>
          </div>
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
