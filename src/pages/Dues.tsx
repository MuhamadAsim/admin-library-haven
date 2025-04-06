import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DueForm } from "@/components/Dues/DueForm";
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
import { AlertTriangle, PlusCircle } from "lucide-react";
import { Due, dues as initialDues, getMemberName, getBookTitle } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Dues = () => {
  const [dues, setDues] = useState<Due[]>(initialDues);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<Due | null>(null);

  // Define table columns
  const columns: Column<Due>[] = [
    {
      header: "Member",
      accessorKey: "memberId",
      enableSorting: true,
      cell: (due) => getMemberName(due.memberId),
    },
    {
      header: "Book",
      accessorKey: "bookId",
      enableSorting: true,
      cell: (due) => getBookTitle(due.bookId),
    },
    {
      header: "Issue Date",
      accessorKey: "issueDate",
      enableSorting: true,
      cell: (due) => new Date(due.issueDate).toLocaleDateString(),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      enableSorting: true,
      cell: (due) => {
        const dueDate = new Date(due.dueDate);
        const today = new Date();
        const isOverdue = !due.returnDate && dueDate < today;
        
        return (
          <div className="flex items-center">
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {dueDate.toLocaleDateString()}
            </span>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 ml-1.5 text-destructive" />
            )}
          </div>
        );
      },
    },
    {
      header: "Return Status",
      accessorKey: "returnDate",
      enableSorting: true,
      cell: (due) => {
        if (due.returnDate) {
          return (
            <div className="flex items-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 font-normal">
                Returned
              </Badge>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(due.returnDate).toLocaleDateString()}
              </span>
            </div>
          );
        }
        
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 font-normal">
            Not Returned
          </Badge>
        );
      },
    },
    {
      header: "Fine",
      accessorKey: "fineAmount",
      enableSorting: true,
      cell: (due) => {
        if (due.fineAmount === 0) {
          return <span className="text-muted-foreground">No Fine</span>;
        }
        
        const statusConfig = {
          pending: { label: "Pending", classes: "bg-amber-100 text-amber-800" },
          paid: { label: "Paid", classes: "bg-green-100 text-green-800" },
          waived: { label: "Waived", classes: "bg-blue-100 text-blue-800" },
        };
        
        const config = statusConfig[due.status];
        
        return (
          <div className="flex items-center space-x-2">
            <span>${due.fineAmount.toFixed(2)}</span>
            {due.fineAmount > 0 && (
              <Badge variant="outline" className={cn("font-normal", config.classes)}>
                {config.label}
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  // Handle form submission
  const handleSaveDue = (due: Due) => {
    if (isEditDialogOpen) {
      // Update existing due
      setDues(dues.map((d) => (d.id === due.id ? due : d)));
    } else {
      // Add new due
      setDues([...dues, due]);
    }
  };

  // Handle due deletion
  const handleDeleteDue = () => {
    if (selectedDue) {
      setDues(dues.filter((d) => d.id !== selectedDue.id));
      toast.success("Record deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedDue(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Dues & Returns</h1>
            <p className="text-muted-foreground">
              Manage book issuances, returns, and dues collection.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        </div>

        {/* Dues Table */}
        <DataTable
          data={dues}
          columns={columns}
          onEdit={(due) => {
            setSelectedDue(due);
            setIsEditDialogOpen(true);
          }}
          onDelete={(due) => {
            setSelectedDue(due);
            setIsDeleteDialogOpen(true);
          }}
        />

        {/* Add/Edit Due Form */}
        <DueForm
          isOpen={isAddDialogOpen || isEditDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedDue(null);
          }}
          onSave={handleSaveDue}
          initialData={selectedDue || undefined}
          mode={isEditDialogOpen ? "edit" : "create"}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this record? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedDue(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDue}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Dues;
