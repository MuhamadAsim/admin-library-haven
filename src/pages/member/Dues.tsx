
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Clock, CalendarCheck, Loader2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import * as dueService from '@/services/dueService';
import { Due } from '@/lib/data';

interface FormattedDue extends Due {
  type: 'late' | 'damage' | 'membership';
  amount: number;
  bookTitle?: string;
}

export default function MemberDues() {
  const [dues, setDues] = useState<FormattedDue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDues = async () => {
      try {
        setIsLoading(true);
        const user = authService.getCurrentUser();
        if (!user) return;

        // In a real implementation, we'd get member ID from the user object
        const data = await dueService.getDues();
        
        // Format the data to match our component's expected structure
        const formattedDues = data.map((due: any) => ({
          id: due._id || due.id,
          memberId: due.memberId,
          bookId: typeof due.bookId === 'object' ? due.bookId._id || due.bookId.id : due.bookId,
          issueDate: due.issueDate,
          dueDate: due.dueDate,
          returnDate: due.returnDate,
          fineAmount: due.fineAmount,
          status: due.status,
          // Added properties for UI
          amount: due.fineAmount,
          type: (due.returnDate ? 'late' : (due.fineAmount > 0 ? 'damage' : 'membership')) as 'late' | 'damage' | 'membership',
          // Handle both populated and non-populated bookId
          bookTitle: due.bookId && typeof due.bookId === 'object' ? due.bookId.title : ''
        }));
        
        setDues(formattedDues);
      } catch (error) {
        console.error("Error fetching dues:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch dues. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDues();
  }, [toast]);

  const pendingDues = dues.filter(due => due.status === 'pending');
  const paidDues = dues.filter(due => due.status === 'paid' || due.status === 'waived');
  
  const totalDue = pendingDues.reduce((sum, due) => sum + due.amount, 0);

  const handlePayDue = async (id: string) => {
    try {
      await dueService.updateDue(id, { status: 'paid' });
      
      setDues(dues.map(due => 
        due.id === id ? { ...due, status: 'paid' as const } : due
      ));
      
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
    }
  };

  const handlePayAll = async () => {
    try {
      // Update all pending dues to paid
      for (const due of pendingDues) {
        await dueService.updateDue(due.id, { status: 'paid' });
      }
      
      setDues(dues.map(due => 
        due.status === 'pending' ? { ...due, status: 'paid' as const } : due
      ));
      
      toast({
        title: "All payments processed",
        description: `You have successfully paid $${totalDue.toFixed(2)}.`,
      });
    } catch (error) {
      console.error("Error processing payments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payments. Please try again.",
      });
    }
  };

  const getDueTypeIcon = (type: Due['type']) => {
    switch (type) {
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'damage':
        return <DollarSign className="h-4 w-4" />;
      case 'membership':
        return <CalendarCheck className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getDueTypeBadge = (type: Due['type']) => {
    switch (type) {
      case 'late':
        return <Badge variant="outline" className="bg-yellow-500 text-white">Late Fee</Badge>;
      case 'damage':
        return <Badge variant="outline" className="bg-red-500 text-white">Damage Fee</Badge>;
      case 'membership':
        return <Badge variant="outline" className="bg-blue-500 text-white">Membership</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-500 text-white">Fee</Badge>;
    }
  };

  const getDueDescription = (due: Due) => {
    if (due.type === 'late') {
      return "Late return fee";
    } else if (due.type === 'damage') {
      return "Book damage fee";
    } else if (due.type === 'membership') {
      return "Annual membership renewal";
    }
    return "Library fee";
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">My Dues</h2>
          <Card className="w-full md:w-auto">
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Due</p>
                <p className="text-2xl font-bold">${dues.filter(due => due.status === 'pending').reduce((sum, due) => sum + due.amount, 0).toFixed(2)}</p>
              </div>
              {dues.filter(due => due.status === 'pending').length > 0 && (
                <Button onClick={() => {
                  const pendingDues = dues.filter(due => due.status === 'pending');
                  pendingDues.forEach(async due => {
                    await dueService.updateDue(due.id, { status: 'paid' });
                  });
                  
                  setDues(dues.map(due => 
                    due.status === 'pending' ? { ...due, status: 'paid' as const } : due
                  ));
                  
                  toast({
                    title: "All payments processed",
                    description: `You have successfully paid $${pendingDues.reduce((sum, due) => sum + due.amount, 0).toFixed(2)}.`,
                  });
                }}>Pay All</Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({dues.filter(due => due.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({dues.filter(due => due.status === 'paid' || due.status === 'waived').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {dues.filter(due => due.status === 'pending').length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No pending dues</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any pending payments at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dues.filter(due => due.status === 'pending').map((due) => (
                      <Card key={due.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">${due.amount.toFixed(2)}</CardTitle>
                            {due.type === 'late' ? (
                              <Badge variant="outline" className="bg-yellow-500 text-white">Late Fee</Badge>
                            ) : due.type === 'damage' ? (
                              <Badge variant="outline" className="bg-red-500 text-white">Damage Fee</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500 text-white">Membership</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {due.bookTitle && `Book: ${due.bookTitle}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p>
                            {due.type === 'late' ? "Late return fee" : 
                             due.type === 'damage' ? "Book damage fee" : 
                             "Annual membership renewal"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Due by: {new Date(due.dueDate).toLocaleDateString()}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            onClick={async () => {
                              try {
                                await dueService.updateDue(due.id, { status: 'paid' });
                                
                                setDues(dues.map(d => 
                                  d.id === due.id ? { ...d, status: 'paid' as const } : d
                                ));
                                
                                toast({
                                  title: "Payment successful",
                                  description: "Your payment has been processed successfully.",
                                });
                              } catch (error) {
                                console.error("Error processing payment:", error);
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: "Failed to process payment. Please try again.",
                                });
                              }
                            }}
                          >
                            Pay Now
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="paid" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {dues.filter(due => due.status === 'paid' || due.status === 'waived').length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No payment history</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't made any payments yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dues.filter(due => due.status === 'paid' || due.status === 'waived').map((due) => (
                      <Card key={due.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">${due.amount.toFixed(2)}</CardTitle>
                            {due.type === 'late' ? (
                              <Badge variant="outline" className="bg-yellow-500 text-white">Late Fee</Badge>
                            ) : due.type === 'damage' ? (
                              <Badge variant="outline" className="bg-red-500 text-white">Damage Fee</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-500 text-white">Membership</Badge>
                            )}
                          </div>
                          <CardDescription>
                            {due.bookTitle && `Book: ${due.bookTitle}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>
                            {due.type === 'late' ? "Late return fee" : 
                             due.type === 'damage' ? "Book damage fee" : 
                             "Annual membership renewal"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Paid on: {due.returnDate ? new Date(due.returnDate).toLocaleDateString() : new Date().toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MemberLayout>
  );
}
