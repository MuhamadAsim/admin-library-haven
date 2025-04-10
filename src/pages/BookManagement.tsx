
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { useBookManagement } from "@/hooks/useBookManagement";
import { IssueBookForm } from "@/components/Books/IssueBookForm";
import { ReturnBookForm } from "@/components/Books/ReturnBookForm";

// Wrap the component in React.memo to prevent unnecessary re-renders
const BookManagement = memo(function BookManagement() {
  const { books, setBooks, members, booksLoading, membersLoading } = useBookManagement();

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Book Management</h2>
        
        <Tabs defaultValue="issue">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issue">Issue Books</TabsTrigger>
            <TabsTrigger value="return">Return Books</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issue" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue a Book to Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IssueBookForm
                  books={books}
                  members={members}
                  booksLoading={booksLoading}
                  membersLoading={membersLoading}
                  onBookIssued={setBooks}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="return" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Books</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReturnBookForm
                  books={books}
                  members={members}
                  membersLoading={membersLoading}
                  onBookReturned={setBooks}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
});

export default BookManagement;
