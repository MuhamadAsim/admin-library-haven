
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Clock, CalendarCheck } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";

interface Due {
  id: string;
  type: 'late' | 'damage' | 'membership';
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid';
  bookTitle?: string;
}

export default function MemberDues() {
  const [dues, setDues] = useState<Due[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDues = async () => {
      try {
        // In a real app, you would fetch from your API
        // For demo, we'll use some sample data
        const sampleDues: Due[] = [
          {
            id: "1",
            type: 'late',
            amount: 5.25,
            description: "Late return fee",
            bookTitle: "To Kill a Mockingbird",
            dueDate: "2025-04-15",
            status: 'pending',
          },
          {
            id: "2",
            type: 'membership',
            amount: 25.00,
            description: "Annual membership renewal",
            dueDate: "2025-05-01",
            status: 'pending',
          },
          {
            id: "3",
            type: 'damage',
            amount: 10.50,
            description: "Book damage fee",
            bookTitle: "1984",
            dueDate: "2025-03-30",
            status: 'paid',
          },
        ];
        
        setDues(sampleDues);
      } catch (error) {
        console.error("Error fetching dues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDues();
  }, []);

  const pendingDues = dues.filter(due => due.status === 'pending');
  const paidDues = dues.filter(due => due.status === 'paid');
  
  const totalDue = pendingDues.reduce((sum, due) => sum + due.amount, 0);

  const handlePayDue = (id: string) => {
    // In a real app, this would call your API to process the payment
    setDues(dues.map(due => 
      due.id === id ? { ...due, status: 'paid' as const } : due
    ));
    
    toast({
      title: "Payment successful",
      description: "Your payment has been processed successfully.",
    });
  };

  const handlePayAll = () => {
    // In a real app, this would call your API to process all payments
    setDues(dues.map(due => ({ ...due, status: 'paid' as const })));
    
    toast({
      title: "All payments processed",
      description: `You have successfully paid $${totalDue.toFixed(2)}.`,
    });
  };

  const getDueTypeIcon = (type: Due['type']) => {
    switch (type) {
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'damage':
        return <DollarSign className="h-4 w-4" />;
      case 'membership':
        return <CalendarCheck className="h-4 w-4" />;
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
    }
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
                <p className="text-2xl font-bold">${totalDue.toFixed(2)}</p>
              </div>
              {totalDue > 0 && (
                <Button onClick={handlePayAll}>Pay All</Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingDues.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidDues.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-muted rounded w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {pendingDues.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No pending dues</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You don't have any pending payments at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDues.map((due) => (
                      <Card key={due.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">${due.amount.toFixed(2)}</CardTitle>
                            {getDueTypeBadge(due.type)}
                          </div>
                          <CardDescription>
                            {due.bookTitle && `Book: ${due.bookTitle}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p>{due.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Due by: {new Date(due.dueDate).toLocaleDateString()}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            onClick={() => handlePayDue(due.id)}
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
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {paidDues.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No payment history</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You haven't made any payments yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paidDues.map((due) => (
                      <Card key={due.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">${due.amount.toFixed(2)}</CardTitle>
                            {getDueTypeBadge(due.type)}
                          </div>
                          <CardDescription>
                            {due.bookTitle && `Book: ${due.bookTitle}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{due.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Paid on: {new Date().toLocaleDateString()}
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
