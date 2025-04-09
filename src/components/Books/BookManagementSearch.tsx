
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
  const [commandKey, setCommandKey] = useState(Date.now().toString());
  const [validItems, setValidItems] = useState<SearchItemProps[]>([]);

  // Validate incoming items whenever they change
  useEffect(() => {
    try {
      // Ensure items is an array and all items have necessary properties
      const safeItems = Array.isArray(items) 
        ? items.filter(item => item && typeof item === 'object' && (item.id || item._id) && item.label)
        : [];
      
      // Set valid items for use in component
      setValidItems(safeItems);
      
      // Reset command component to prevent stale data issues
      setCommandKey(Date.now().toString());
    } catch (error) {
      console.error("Error processing search items:", error);
      setValidItems([]);
    }
  }, [items]);

  const selectedItem = validItems.find(item => 
    (item.id && item.id === selectedId) || (item._id && item._id === selectedId)
  );
  
  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchTerm('');
    setOpen(false);
  };

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (searchTerm.trim() === '') {
      return validItems;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return validItems.filter(item => {
      if (!item) return false;
      
      const matchLabel = item.label && item.label.toLowerCase().includes(lowerSearchTerm);
      const matchDescription = item.description && item.description.toLowerCase().includes(lowerSearchTerm);
      
      return matchLabel || matchDescription;
    });
  }, [searchTerm, validItems]);

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
          <Command key={commandKey} shouldFilter={false}>
            <CommandInput 
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <CommandItem
                        key={item.id || item._id}
                        value={item.id || item._id || ""}
                        onSelect={() => handleSelect(item.id || item._id || "")}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            (item.id === selectedId || item._id === selectedId)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div>
                          <div>{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {emptyMessage}
                    </div>
                  )}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
