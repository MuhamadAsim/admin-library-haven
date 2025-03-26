
import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ReservationForm } from "@/components/Reservations/ReservationForm";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, AlertTriangle, BookCheck, Calendar, X } from "lucide-react";
import { Reservation, reservations as initialReservations, getMemberName, getBookTitle } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Define table columns
  const columns: Column<Reservation>[] = [
    {
      header: "Member",
      accessorKey: "memberId",
      enableSorting: true,
      cell: (reservation) => getMemberName(reservation.memberId),
    },
    {
      header: "Book",
      accessorKey: "bookId",
      enableSorting: true,
      cell: (reservation) => getBookTitle(reservation.bookId),
    },
    {
      header: "Reservation Date",
      accessorKey: "reservationDate",
      enableSorting: true,
      cell: (reservation) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {new Date(reservation.reservationDate).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      cell: (reservation) => {
        const statusConfig = {
          pending: { 
            label: "Pending", 
            classes: "bg-amber-100 text-amber-800",
            icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> 
          },
          fulfilled: { 
            label: "Fulfilled", 
            classes: "bg-green-100 text-green-800",
            icon: <BookCheck className="h-3.5 w-3.5 mr-1.5" /> 
          },
          cancelled: { 
            label: "Cancelled", 
            classes: "bg-gray-100 text-gray-800",
            icon: <X className="h-3.5 w-3.5 mr-1.5" />
          },
        };
        
        const config = statusConfig[reservation.status];
        
        return (
          <Badge variant="outline" className={cn("font-normal flex items-center", config.classes)}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      header: "Notification",
      accessorKey: "notificationSent",
      enableSorting: true,
      cell: (reservation) => {
        if (reservation.status !== "pending") {
          return <span className="text-muted-foreground text-sm">N/A</span>;
        }
        
        return (
          <Badge variant={reservation.notificationSent ? "outline" : "secondary"} className="font-normal">
            {reservation.notificationSent ? "Sent" : "Pending"}
          </Badge>
        );
      },
    },
  ];

  // Handle form submission
  const handleSaveReservation = (reservation: Reservation) => {
    if (isEditDialogOpen) {
      // Update existing reservation
      setReservations(reservations.map((r) => (r.id === reservation.id ? reservation : r)));
    } else {
      // Add new reservation
      setReservations([...reservations, reservation]);
    }
  };

  // Handle reservation deletion
  const handleDeleteReservation = () => {
    if (selectedReservation) {
      setReservations(reservations.filter((r) => r.id !== selectedReservation.id));
      toast.success("Reservation cancelled successfully");
      setIsDeleteDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Reservations</h1>
            <p className="text-muted-foreground">
              Manage book reservations and waitlists
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Reserve Book
          </Button>
        </div>

        {/* Reservations Table */}
        <DataTable
          data={reservations}
          columns={columns}
          onEdit={(reservation) => {
            setSelectedReservation(reservation);
            setIsEditDialogOpen(true);
          }}
          onDelete={(reservation) => {
            setSelectedReservation(reservation);
            setIsDeleteDialogOpen(true);
          }}
        />

        {/* Add/Edit Reservation Form */}
        <ReservationForm
          isOpen={isAddDialogOpen || isEditDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedReservation(null);
          }}
          onSave={handleSaveReservation}
          initialData={selectedReservation || undefined}
          mode={isEditDialogOpen ? "edit" : "create"}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this reservation? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedReservation(null)}>
                Keep Reservation
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReservation}
                className="bg-destructive text-destructive-foreground"
              >
                Cancel Reservation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Reservations;
