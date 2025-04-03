
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";

// Admin Pages
import Index from "./pages/Index";
import Members from "./pages/Members";
import Books from "./pages/Books";
import Dues from "./pages/Dues";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/Login";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberBooks from "./pages/member/Books";
import MemberReservations from "./pages/member/Reservations";
import MemberDues from "./pages/member/Dues";
import MemberNotifications from "./pages/member/Notifications";

const queryClient = new QueryClient();

// Get saved theme from localStorage or default to system
const savedTheme = localStorage.getItem("vite-ui-theme") || "system";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
    };

    checkAuth();
    // Add event listener for storage changes (for multi-tab logout)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <ThemeProvider defaultTheme={savedTheme as "light" | "dark" | "system"}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/members" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Members />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/books" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Books />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dues" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Dues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requireAdmin>
                    <Settings />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Member Routes */}
              <Route 
                path="/member/dashboard" 
                element={
                  <ProtectedRoute>
                    <MemberDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member/books" 
                element={
                  <ProtectedRoute>
                    <MemberBooks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member/reservations" 
                element={
                  <ProtectedRoute>
                    <MemberReservations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member/dues" 
                element={
                  <ProtectedRoute>
                    <MemberDues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/member/notifications" 
                element={
                  <ProtectedRoute>
                    <MemberNotifications />
                  </ProtectedRoute>
                } 
              />

              {/* Redirect based on authentication */}
              <Route 
                path="/" 
                element={
                  isAuthenticated ? (
                    authService.isAdmin() ? <Navigate to="/" /> : <Navigate to="/member/dashboard" />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
