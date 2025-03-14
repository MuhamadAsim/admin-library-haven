
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  enableSorting?: boolean;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  idField?: keyof T;
};

export function DataTable<T>({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  idField = "id" as keyof T 
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Handle sorting
  const handleSort = (column: keyof T | string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Filter data based on search query
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    
    // Search across all string properties
    return Object.entries(item).some(([_, value]) => {
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy as keyof T];
    const bValue = b[sortBy as keyof T];
    
    if (aValue === bValue) return 0;
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    return sortDirection === "asc" 
      ? (aValue < bValue ? -1 : 1)
      : (bValue < aValue ? -1 : 1);
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Get accessor value based on key
  const getAccessorValue = (item: T, accessorKey: keyof T | string): any => {
    // If the accessor contains periods, it's a nested path
    if (typeof accessorKey === "string" && accessorKey.includes(".")) {
      const keys = accessorKey.split(".");
      let value: any = item;
      
      for (const key of keys) {
        if (value === null || value === undefined) return null;
        value = value[key as keyof typeof value];
      }
      
      return value;
    }
    
    return item[accessorKey as keyof T];
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.enableSorting) return null;
    
    if (sortBy === column.accessorKey) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="h-4 w-4 ml-1" />
      );
    }
    
    return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-[250px] bg-background"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden animate-scale-in">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={cn(
                    "font-medium",
                    column.enableSorting && "cursor-pointer select-none"
                  )}
                  onClick={() => {
                    if (column.enableSorting) {
                      handleSort(column.accessorKey);
                    }
                  }}
                >
                  <div className="flex items-center">
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={String(item[idField])} className="hover:bg-muted/40 transition-colors">
                  {columns.map((column, columnIndex) => (
                    <TableCell key={columnIndex}>
                      {column.cell
                        ? column.cell(item)
                        : getAccessorValue(item, column.accessorKey)}
                    </TableCell>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              View details
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => onDelete(item)}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
