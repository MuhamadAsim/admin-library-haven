
import { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, CreditCard, Library, BookMarked, AlertTriangle } from "lucide-react";
import { members, books, dues } from "@/lib/data";
import { cn } from "@/lib/utils";

// Animated counter hook
const useAnimatedCounter = (targetValue: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // If target is 0, don't animate
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

const Index = () => {
  // Summary statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'available').length;
  const borrowedBooks = books.filter(b => b.status === 'borrowed').length;
  const pendingDues = dues.filter(d => d.status === 'pending').length;
  
  // Animated counters
  const animatedTotalMembers = useAnimatedCounter(totalMembers);
  const animatedActiveMembers = useAnimatedCounter(activeMembers);
  const animatedTotalBooks = useAnimatedCounter(totalBooks);
  const animatedAvailableBooks = useAnimatedCounter(availableBooks);
  const animatedBorrowedBooks = useAnimatedCounter(borrowedBooks);
  const animatedPendingDues = useAnimatedCounter(pendingDues);
  
  // Get recent activities (last 5 dues)
  const recentActivities = [...dues]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);
  
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Welcome to Library Admin</h1>
          <p className="text-muted-foreground">Manage your library operations efficiently with our admin system.</p>
        </div>
        
        {/* Summary Cards */}
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
                {dues.reduce((acc, due) => due.status === 'pending' ? acc + due.fineAmount : acc, 0).toFixed(2)} USD total pending
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
        
        {/* Quick Actions */}
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
          
          {/* Recent Activities */}
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((due) => {
                  // Find book and member
                  const book = books.find(b => b.id === due.bookId);
                  const member = members.find(m => m.id === due.memberId);
                  
                  if (!book || !member) return null;
                  
                  return (
                    <div key={due.id} className="flex items-start space-x-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        due.returnDate ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {due.returnDate ? <BookMarked className="h-4 w-4" /> : <Library className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {due.returnDate ? `${member.name} returned` : `${member.name} borrowed`}{" "}
                          <span className="font-semibold">{book.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {due.returnDate ? new Date(due.returnDate).toLocaleDateString() : new Date(due.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {!due.returnDate && new Date(due.dueDate) < new Date() && (
                        <div className="flex items-center text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">Overdue</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
