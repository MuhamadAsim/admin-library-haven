
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Loader2 } from "lucide-react";
import MemberLayout from "@/components/Layout/MemberLayout";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import * as reservationService from '@/services/reservationService';

interface Reservation {
  id: string;
  bookId: {
    id: string;
    title: string;
    author: string;
  };
  status: 'pending' | 'fulfilled' | 'cancelled';
  reservationDate: string;
}

export default function MemberReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const user = authService.getCurrentUser();
        if (!user) return;

        // In a real implementation, we'd get member ID from the user object
        // For now, we'll get all reservations for the current user's associated member
        const data = await reservationService.getReservations();
        
        // Format the data to match our component's expected structure
        const formattedReservations = data.map((reservation: any) => ({
          id: reservation._id,
          bookId: {
            id: reservation.bookId._id,
            title: reservation.bookId.title,
            author: reservation.bookId.author
          },
          status: reservation.status,
          reservationDate: reservation.reservationDate
        }));
        
        setReservations(formattedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch reservations. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [toast]);

  const handleCancelReservation = async (id: string) => {
    try {
      await reservationService.updateReservation(id, { status: 'cancelled' });
      
      setReservations(reservations.map(res => 
        res.id === id ? { ...res, status: 'cancelled' as const } : res
      ));
      
      toast({
        title: "Reservation cancelled",
        description: "Your book reservation has been cancelled successfully.",
      });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
      });
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500 text-white">Pending</Badge>;
      case 'fulfilled':
        return <Badge variant="outline" className="bg-green-500 text-white">Ready for pickup</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate expiration date (1 month from reservation date)
  const getExpirationDate = (reservationDate: string) => {
    const date = new Date(reservationDate);
    date.setMonth(date.getMonth() + 1);
    return date;
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
                      <CardTitle className="line-clamp-1">{reservation.bookId.title}</CardTitle>
                      <CardDescription>by {reservation.bookId.author}</CardDescription>
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
                          <span>{getExpirationDate(reservation.reservationDate).toLocaleDateString()}</span>
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
                      {reservation.status === 'fulfilled' && (
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
