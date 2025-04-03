
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated and has the correct role
    const isAuthenticated = authService.isAuthenticated();
    const hasCorrectRole = requireAdmin 
      ? authService.isAdmin() 
      : (authService.isAdmin() || authService.isMember());

    setIsAuthorized(isAuthenticated && hasCorrectRole);
    setIsLoading(false);

    if (isAuthenticated && !hasCorrectRole) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have permission to access this page.",
      });
    }
  }, [requireAdmin, toast]);

  if (isLoading) {
    // You could add a loading spinner here
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthorized) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
