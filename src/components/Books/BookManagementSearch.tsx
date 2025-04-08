
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

  // Make sure items is always an array and contains valid data
  const safeItems = Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
  
  const selectedItem = safeItems.find(item => 
    (item.id && item.id === selectedId) || (item._id && item._id === selectedId)
  );
  
  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchTerm('');
    setOpen(false);
  };

  useEffect(() => {
    // Reset command component when items change significantly
    // This helps prevent the "undefined is not iterable" error
    if (items && Array.isArray(items)) {
      setCommandKey(Date.now().toString());
    }
  }, [items]);

  // Make sure we're filtering a valid array with valid objects
  const filteredItems = React.useMemo(() => {
    if (searchTerm.trim() === '') {
      return safeItems;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return safeItems.filter(item => {
      if (!item) return false;
      
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
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.id || item._id}
                      value={item.label}
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
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
