
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Loader2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  status: 'pending' | 'ready' | 'cancelled';
  reservationDate: string;
  expirationDate: string;
}

export default function MemberReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // In a real app, you would fetch from your API
        // For demo, we'll use some sample data
        const sampleReservations: Reservation[] = [
          {
            id: "1",
            bookId: "101",
            bookTitle: "To Kill a Mockingbird",
            bookAuthor: "Harper Lee",
            status: 'pending',
            reservationDate: "2025-03-20",
            expirationDate: "2025-04-20",
          },
          {
            id: "2",
            bookId: "102",
            bookTitle: "The Catcher in the Rye",
            bookAuthor: "J.D. Salinger",
            status: 'ready',
            reservationDate: "2025-03-25",
            expirationDate: "2025-04-25",
          },
          {
            id: "3",
            bookId: "103",
            bookTitle: "The Great Gatsby",
            bookAuthor: "F. Scott Fitzgerald",
            status: 'cancelled',
            reservationDate: "2025-03-10",
            expirationDate: "2025-04-10",
          },
        ];
        
        setReservations(sampleReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancelReservation = (id: string) => {
    // In a real app, this would call your API to cancel the reservation
    setReservations(reservations.map(res => 
      res.id === id ? { ...res, status: 'cancelled' as const } : res
    ));
    
    toast({
      title: "Reservation cancelled",
      description: "Your book reservation has been cancelled successfully.",
    });
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500 text-white">Pending</Badge>;
      case 'ready':
        return <Badge variant="outline" className="bg-green-500 text-white">Ready for pickup</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">My Reservations</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <BookMarked className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No reservations found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You haven't made any book reservations yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{reservation.bookTitle}</CardTitle>
                      <CardDescription>by {reservation.bookAuthor}</CardDescription>
                      <div className="mt-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reserved on:</span>
                          <span>{new Date(reservation.reservationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires on:</span>
                          <span>{new Date(reservation.expirationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {reservation.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Cancel Reservation
                        </Button>
                      )}
                      {reservation.status === 'ready' && (
                        <Button className="w-full">
                          Confirm Pickup
                        </Button>
                      )}
                      {reservation.status === 'cancelled' && (
                        <Button variant="outline" className="w-full" disabled>
                          Reservation Cancelled
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MemberLayout>
  );
}
