import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { useState } from "react";

const DatePicker = ({
  selected,
  onSelect,
  disabled,
  className,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    onSelect(date);
    setOpen(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal group transition-all duration-300",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? (
              <>
                {format(selected, "PPP")}
                <span
                  className="bg-gray-100 py-1 px-3 text-xs rounded-full group-hover:bg-gray-200"
                  onClick={() => handleSelect(null)}
                >
                  Clear
                </span>
              </>
            ) : (
              <span>{placeholder || "Pick a date"}</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
