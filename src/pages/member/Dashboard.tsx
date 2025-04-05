
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookOpen, Clock, Wallet2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

interface BookCountStats {
  borrowed: number;
  reserved: number;
  overdue: number;
  dues: number;
}

export default function MemberDashboard() {
  const [stats, setStats] = useState<BookCountStats>({
    borrowed: 0,
    reserved: 0,
    overdue: 0,
    dues: 0
  });
  
  const user = authService.getCurrentUser();
  
  // Fetch member stats using React Query
  const { data, isLoading } = useQuery({
    queryKey: ['memberStats', user?.id],
    queryFn: async () => {
      try {
        if (!user || !user.id) return null;
        
        // Get member ID from user
        const memberResponse = await api.get(`/users/${user.id}`);
        const memberId = memberResponse.data?.memberId;
        
        if (!memberId) return null;
        
        // Get borrowed books count
        const borrowedResponse = await api.get(`/dues?memberId=${memberId}&status=borrowed`);
        const borrowed = borrowedResponse.data?.length || 0;
        
        // Get reserved books count
        const reservedResponse = await api.get(`/reservations?memberId=${memberId}&status=pending`);
        const reserved = reservedResponse.data?.length || 0;
        
        // Get overdue books count
        const overdueResponse = await api.get(`/dues?memberId=${memberId}&status=overdue`);
        const overdue = overdueResponse.data?.length || 0;
        
        // Get total dues amount
        const duesResponse = await api.get(`/dues?memberId=${memberId}`);
        const dues = duesResponse.data?.reduce(
          (total: number, due: any) => total + (due.fees || 0), 
          0
        ) || 0;
        
        return { borrowed, reserved, overdue, dues };
      } catch (error) {
        console.error("Error fetching member stats:", error);
        return null;
      }
    },
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (data) {
      setStats(data);
    }
  }, [data]);

  return (
    <MemberLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email.split('@')[0] || 'Member'}</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Borrowed Books
              </CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.borrowed}</div>
              <p className="text-xs text-muted-foreground">
                Active borrows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reserved Books
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.reserved}</div>
              <p className="text-xs text-muted-foreground">
                Pending reservations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Books
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? '...' : stats.overdue}</div>
              <p className="text-xs text-muted-foreground">
                Return soon to avoid fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dues
              </CardTitle>
              <Wallet2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${isLoading ? '0.00' : stats.dues.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Outstanding payments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent interactions with the library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-muted-foreground">No recent activities</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Due Dates</CardTitle>
              <CardDescription>
                Books that need to be returned soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-muted-foreground">No books due soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}
