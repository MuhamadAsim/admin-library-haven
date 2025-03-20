
import { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";
import { DataTable, Column } from "@/components/ui/DataTable";
import { MemberForm } from "@/components/Members/MemberForm";
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
import { PlusCircle, User, Loader2 } from "lucide-react";
import { Member } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getMembers, addMember, updateMember, deleteMember } from "@/services/memberService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Members = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch members with React Query
  const { 
    data: members = [], 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['members'],
    queryFn: getMembers
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success("Member added successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "Failed to add member");
    }
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, member }: { id: string, member: Partial<Member> }) => 
      updateMember(id, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success("Member updated successfully");
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "Failed to update member");
    }
  });

  // Delete member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success("Member deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.msg || "Failed to delete member");
    }
  });

  // Define table columns
  const columns: Column<Member>[] = [
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
      cell: (member) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
            <User className="h-4 w-4" />
          </div>
          <div className="font-medium">{member.name}</div>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      enableSorting: true,
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Membership Date",
      accessorKey: "membershipDate",
      enableSorting: true,
      cell: (member) => new Date(member.membershipDate).toLocaleDateString(),
    },
    {
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      cell: (member) => {
        const statusConfig = {
          active: { label: "Active", classes: "bg-green-100 text-green-800 hover:bg-green-200" },
          inactive: { label: "Inactive", classes: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
          suspended: { label: "Suspended", classes: "bg-red-100 text-red-800 hover:bg-red-200" },
        };
        
        const config = statusConfig[member.status];
        
        return (
          <Badge variant="outline" className={cn("font-normal", config.classes)}>
            {config.label}
          </Badge>
        );
      },
    },
  ];

  // Handle form submission
  const handleSaveMember = (member: Member) => {
    if (isEditDialogOpen && selectedMember) {
      // Update existing member
      updateMemberMutation.mutate({ 
        id: selectedMember._id || selectedMember.id, 
        member 
      });
    } else {
      // Add new member
      addMemberMutation.mutate(member);
    }
  };

  // Handle member deletion
  const handleDeleteMember = () => {
    if (selectedMember) {
      deleteMemberMutation.mutate(selectedMember._id || selectedMember.id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Members</h1>
            <p className="text-muted-foreground">
              Manage library members and their information.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Loading or Error States */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading members...</span>
          </div>
        )}

        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            Failed to load members. Please try again later.
          </div>
        )}

        {/* Members Table */}
        {!isLoading && !isError && (
          <DataTable
            data={members}
            columns={columns}
            onEdit={(member) => {
              setSelectedMember(member);
              setIsEditDialogOpen(true);
            }}
            onDelete={(member) => {
              setSelectedMember(member);
              setIsDeleteDialogOpen(true);
            }}
          />
        )}

        {/* Add/Edit Member Form */}
        <MemberForm
          isOpen={isAddDialogOpen || isEditDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedMember(null);
          }}
          onSave={handleSaveMember}
          initialData={selectedMember || undefined}
          mode={isEditDialogOpen ? "edit" : "create"}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="glass-panel">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the member "
                {selectedMember?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedMember(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMember}
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

export default Members;
