
import { useState } from "react";
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
import { PlusCircle, User } from "lucide-react";
import { Member, members as initialMembers } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
    if (isEditDialogOpen) {
      // Update existing member
      setMembers(members.map((m) => (m.id === member.id ? member : m)));
    } else {
      // Add new member
      setMembers([...members, member]);
    }
  };

  // Handle member deletion
  const handleDeleteMember = () => {
    if (selectedMember) {
      setMembers(members.filter((m) => m.id !== selectedMember.id));
      toast.success("Member deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
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

        {/* Members Table */}
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
