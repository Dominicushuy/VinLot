import * as React from "react";
import { DayPicker } from "react-day-picker";
import { vi } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={vi}
      classNames={{
        // months
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-700",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white hover:bg-gray-100 p-0 opacity-70 hover:opacity-100 transition-all duration-200 rounded-md"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        // Bỏ table layout, chuyển sang grid
        table: "grid gap-y-2", // hoặc gap-x tuỳ ý
        head_row: "grid grid-cols-7 gap-1",
        head_cell:
          "text-center text-gray-500 font-semibold text-[0.8rem] uppercase",
        row: "grid grid-cols-7 gap-1",
        cell: "relative text-center text-sm hover:bg-gray-100 rounded-md transition-colors h-10 w-10",

        // day
        day: cn(
          "h-10 w-10 p-0 font-normal hover:bg-primary hover:text-primary-foreground rounded-md transition-all",
          "focus:ring-2 focus:ring-primary focus:outline-none"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
        day_today: "border border-primary text-primary font-bold",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 cursor-not-allowed",
        day_range_middle: "bg-primary/10",
        day_hidden: "invisible",

        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
