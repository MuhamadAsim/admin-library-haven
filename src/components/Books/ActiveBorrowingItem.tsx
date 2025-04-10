
import React from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Due } from "@/lib/data";

interface ActiveBorrowingItemProps {
  due: Due;
  bookTitle: string;
  returnLoading: boolean;
  onReturnBook: (dueId: string, bookId: string, fine: number) => void;
}

export function ActiveBorrowingItem({ due, bookTitle, returnLoading, onReturnBook }: ActiveBorrowingItemProps) {
  const bookId = due.bookId ? (
    typeof due.bookId === 'string' ? 
      due.bookId : (due.bookId.id || due.bookId._id || "")
  ) : "";
  
  if (!bookId) return null;
  
  const dueDate = new Date(due.dueDate);
  const isOverdue = dueDate < new Date();
  const fine = calculateFine(due.dueDate);
  
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{bookTitle}</h4>
          <p className="text-sm text-muted-foreground">
            Due by: {new Date(due.dueDate).toLocaleDateString()}
          </p>
          {isOverdue && (
            <p className="text-sm text-red-500">
              Overdue by {Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
          {fine > 0 && (
            <p className="text-sm font-semibold text-red-500">
              Fine: ${fine.toFixed(2)}
            </p>
          )}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Return
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Book Return</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Book: <strong>{bookTitle}</strong></p>
              {fine > 0 ? (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="font-medium text-red-600 dark:text-red-400">
                    This book is overdue by {Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    Fine amount: ${fine.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-green-600 dark:text-green-400">
                  This book is being returned on time. No fine.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => onReturnBook(due.id || due._id || "", bookId, fine)}
                disabled={returnLoading}
              >
                {returnLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Return"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function calculateFine(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  
  if (due >= today) return 0;
  
  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysOverdue;
}
