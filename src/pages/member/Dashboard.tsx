
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookOpen, Clock, Wallet2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { authService } from "@/services/authService";
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
  const [isLoading, setIsLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, you would have actual API endpoints for these stats
        // For now, we'll just simulate some data
        setStats({
          borrowed: 2,
          reserved: 1,
          overdue: 0,
          dues: 15
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.borrowed}</div>
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
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.reserved}</div>
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
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.overdue}</div>
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
              <div className="text-2xl font-bold">${isLoading ? "..." : stats.dues}</div>
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
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Book borrowed: "The Great Gatsby"</p>
                    <p className="text-xs text-muted-foreground">2 days ago · Due in 12 days</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Book reserved: "To Kill a Mockingbird"</p>
                    <p className="text-xs text-muted-foreground">1 week ago · Waiting for pickup</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Book returned: "1984"</p>
                    <p className="text-xs text-muted-foreground">2 weeks ago · On time</p>
                  </div>
                </div>
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
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">"The Great Gatsby" by F. Scott Fitzgerald</p>
                    <p className="text-xs text-muted-foreground">Due in 12 days · May 16, 2025</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">"Brave New World" by Aldous Huxley</p>
                    <p className="text-xs text-muted-foreground">Due in 5 days · May 9, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}
