
import React, { useState, useEffect } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Label } from '@/components/ui/label';

interface SearchItemProps {
  id: string;
  _id?: string;
  label: string;
  description?: string;
}

interface BookManagementSearchProps {
  items: SearchItemProps[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
  label: string;
  isLoading?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  buttonClassName?: string;
}

export function BookManagementSearch({
  items,
  selectedId,
  onSelect,
  placeholder,
  label,
  isLoading = false,
  disabled = false,
  emptyMessage = "No items found.",
  buttonClassName,
}: BookManagementSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [key, setKey] = useState(Date.now().toString());
  
  // Safety check to ensure items is an array and all items have valid IDs
  const safeItems = React.useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn('BookManagementSearch: items is not an array', items);
      return [];
    }
    
    return items.filter(item => 
      item && 
      typeof item === 'object' && 
      (item.id !== undefined || item._id !== undefined) && 
      item.label
    );
  }, [items]);
  
  // Reset the key when items change to force a re-render of the Command component
  useEffect(() => {
    setKey(Date.now().toString());
  }, [items]);

  // Find the selected item
  const selectedItem = safeItems.find(item => 
    (item.id && item.id === selectedId) || (item._id && item._id === selectedId)
  );
  
  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchTerm('');
    setOpen(false);
  };

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      return safeItems;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return safeItems.filter(item => {
      const matchLabel = item.label && item.label.toLowerCase().includes(lowerSearchTerm);
      const matchDescription = item.description && item.description.toLowerCase().includes(lowerSearchTerm);
      
      return matchLabel || matchDescription;
    });
  }, [searchTerm, safeItems]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`search-${label}`}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", buttonClassName)}
            disabled={disabled}
            id={`search-${label}`}
          >
            {selectedId && selectedItem
              ? selectedItem.label
              : placeholder}
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div key={key} className="w-full">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto p-1">
                {filteredItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                ) : (
                  <div>
                    {filteredItems.map((item) => {
                      const itemId = item.id || item._id || "";
                      const isSelected = selectedId === itemId;
                      
                      return (
                        <div
                          key={itemId}
                          className={cn(
                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            isSelected && "bg-accent text-accent-foreground"
                          )}
                          onClick={() => handleSelect(itemId)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div>{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
