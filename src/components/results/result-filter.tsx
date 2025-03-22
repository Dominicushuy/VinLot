// src/components/results/result-filter.tsx
"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

interface ResultFilterProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ResultFilter({
  selectedDate,
  onDateChange,
}: ResultFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelectYesterday = () => {
    onDateChange(subDays(new Date(), 1));
  };

  const handleSelectToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <p className="text-sm mb-2">Ngày xem kết quả</p>
        <div className="flex space-x-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "EEEE, dd/MM/yyyy", { locale: vi })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={vi}
                selected={selectedDate}
                onSelect={(date) => {
                  onDateChange(date || new Date());
                  setOpen(false);
                }}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <p className="text-sm mb-2">Xem nhanh</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleSelectToday}>
            Hôm nay
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelectYesterday}>
            Hôm qua
          </Button>
        </div>
      </div>
    </div>
  );
}
