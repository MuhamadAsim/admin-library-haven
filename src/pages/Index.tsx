
import { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, CreditCard, Library, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "@/services/api";

// Animated counter hook
const useAnimatedCounter = (targetValue: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (targetValue === 0) {
      setCount(0);
      return;
    }
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * targetValue));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [targetValue, duration]);
  
  return count;
};

// Interface for dashboard stats
interface DashboardStats {
  members: { total: number, active: number };
  books: { total: number, available: number, borrowed: number };
  dues: { pending: number, total: number };
}

const Index = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    members: { total: 0, active: 0 },
    books: { total: 0, available: 0, borrowed: 0 },
    dues: { pending: 0, total: 0 }
  });
  
  // Use React Query to fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        // Fetch members count
        const membersResponse = await api.get('/members');
        const members = membersResponse.data;
        const activeMembers = members.filter((m: any) => m.status === 'active');
        
        // Fetch books count
        const booksResponse = await api.get('/books');
        const books = booksResponse.data;
        const availableBooks = books.filter((b: any) => b.availableCopies > 0);
        const borrowedBooks = books.filter((b: any) => b.status === 'borrowed');
        
        // Fetch dues info 
        const duesResponse = await api.get('/dues');
        const dues = duesResponse.data;
        const pendingDues = dues.filter((d: any) => d.status === 'pending');
        const totalAmount = pendingDues.reduce((sum: number, due: any) => sum + (due.amount || 0), 0);
        
        return {
          members: { 
            total: members.length, 
            active: activeMembers.length 
          },
          books: { 
            total: books.length, 
            available: availableBooks.length,
            borrowed: borrowedBooks.length 
          },
          dues: { 
            pending: pendingDues.length, 
            total: totalAmount 
          }
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
          members: { total: 0, active: 0 },
          books: { total: 0, available: 0, borrowed: 0 },
          dues: { pending: 0, total: 0 }
        };
      }
    }
  });
  
  // Update local state when stats are loaded
  useEffect(() => {
    if (stats) {
      setDashboardStats(stats);
    }
  }, [stats]);
  
  // Use animated counters
  const animatedTotalMembers = useAnimatedCounter(dashboardStats.members.total);
  const animatedActiveMembers = useAnimatedCounter(dashboardStats.members.active);
  const animatedTotalBooks = useAnimatedCounter(dashboardStats.books.total);
  const animatedAvailableBooks = useAnimatedCounter(dashboardStats.books.available);
  const animatedBorrowedBooks = useAnimatedCounter(dashboardStats.books.borrowed);
  const animatedPendingDues = useAnimatedCounter(dashboardStats.dues.pending);
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Welcome to Library Admin</h1>
          <p className="text-muted-foreground">Manage your library operations efficiently with our admin system.</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="floating-card glass-card overflow-hidden">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Members
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{animatedTotalMembers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {animatedActiveMembers} active members
              </p>
              <div className="mt-4">
                <Button size="sm" variant="outline" asChild>
                  <a href="/members">View Members</a>
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 -mt-4 -mr-8 h-40 w-40 bg-primary/10 rounded-full opacity-70 blur-xl"></div>
          </Card>
          
          <Card className="floating-card glass-card overflow-hidden">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  Books
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{animatedTotalBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {animatedAvailableBooks} available • {animatedBorrowedBooks} borrowed
              </p>
              <div className="mt-4">
                <Button size="sm" variant="outline" asChild>
                  <a href="/books">View Books</a>
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 -mt-4 -mr-8 h-40 w-40 bg-primary/10 rounded-full opacity-70 blur-xl"></div>
          </Card>
          
          <Card className="floating-card glass-card overflow-hidden">
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-primary" />
                  Pending Dues
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{animatedPendingDues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${dashboardStats.dues.total.toFixed(2)} USD total pending
              </p>
              <div className="mt-4">
                <Button size="sm" variant="outline" asChild>
                  <a href="/dues">View Dues</a>
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 -mt-4 -mr-8 h-40 w-40 bg-primary/10 rounded-full opacity-70 blur-xl"></div>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" asChild>
                  <a href="/members">
                    <Users className="mr-1 h-4 w-4" />
                    Add Member
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href="/books">
                    <BookOpen className="mr-1 h-4 w-4" />
                    Add Book
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href="/dues">
                    <Library className="mr-1 h-4 w-4" />
                    Issue Book
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activities to display</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
