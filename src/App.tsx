
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
import Reservations from "./pages/Reservations";

// Auth Pages
import Login from "./pages/Login";

// Member Pages
import MemberDashboard from "./pages/member/Dashboard";
import MemberBooks from "./pages/member/Books";
import MemberBorrowedBooks from "./pages/member/BorrowedBooks";
import MemberReservations from "./pages/member/Reservations";
import MemberDues from "./pages/member/Dues";
import MemberNotifications from "./pages/member/Notifications";

// Book Management Page
import BookManagement from "./pages/BookManagement";

const queryClient = new QueryClient();

// Get saved theme from localStorage or default to system
const savedTheme = localStorage.getItem("vite-ui-theme") || "system";

function App() {
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
    <ThemeProvider defaultTheme="system" storageKey="library-theme">
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
                  <ProtectedRoute requireAdmin={true}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/books" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Books />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/book-management" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <BookManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/members" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Members />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dues" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Dues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reservations" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Reservations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requireAdmin={true}>
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
                path="/member/borrowed-books" 
                element={
                  <ProtectedRoute>
                    <MemberBorrowedBooks />
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
}

export default App;
