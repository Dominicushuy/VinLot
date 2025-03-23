import * as React from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { vi } from "date-fns/locale";
import { format, isValid, isSameDay, isBefore, isAfter } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useDemoMode } from "@/lib/hooks/use-demo-mode";

import "react-day-picker/dist/style.css";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker>;

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: EnhancedCalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      locale={vi}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-medium text-gray-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between",
        head_cell:
          "text-gray-500 w-10 font-normal text-[0.8rem] uppercase text-center",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent rounded-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        ),
        day_range_start: "day-range-start rounded-l-md",
        day_range_end: "day-range-end rounded-r-md",
        day_selected:
          "bg-lottery-primary text-white hover:bg-lottery-primary hover:text-white",
        day_today:
          "border border-lottery-primary/50 text-lottery-primary font-medium",
        day_outside: "text-gray-400 opacity-50",
        day_disabled:
          "text-gray-300 cursor-not-allowed opacity-40 hover:bg-transparent hover:text-inherit",
        day_range_middle: "bg-accent",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
EnhancedCalendar.displayName = "EnhancedCalendar";

// Định nghĩa props cho DatePicker
interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabled?: boolean;
  error?: string;
}

// DatePicker component
export function DatePicker({
  date,
  onDateChange,
  label,
  placeholder = "Chọn ngày",
  minDate,
  maxDate,
  disabledDates = [],
  disabled = false,
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isDemo } = useDemoMode();
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Kiểm tra disable dates
  const isDateDisabled = React.useCallback(
    (day: Date) => {
      // Nếu đang ở chế độ demo, không disable ngày quá khứ
      const isPastDate =
        !isDemo && isBefore(day, new Date()) && !isSameDay(day, new Date());

      // Kiểm tra minDate và maxDate
      const isBeforeMin = minDate ? isBefore(day, minDate) : false;
      const isAfterMax = maxDate ? isAfter(day, maxDate) : false;

      // Kiểm tra với disabledDates
      const isDisabledDate = disabledDates.some(
        (disabledDate) => isValid(disabledDate) && isSameDay(day, disabledDate)
      );

      return isPastDate || isBeforeMin || isAfterMax || isDisabledDate;
    },
    [isDemo, minDate, maxDate, disabledDates]
  );

  // Xử lý click ngoài
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        calendarRef.current &&
        buttonRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          >
            {date && isValid(date) ? (
              <span>{format(date, "EEEE, dd/MM/yyyy", { locale: vi })}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </button>

          {isOpen && (
            <div
              ref={calendarRef}
              className="absolute z-50 mt-2 bg-popover shadow-md border rounded-md w-auto"
            >
              <EnhancedCalendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  onDateChange(selectedDate);
                  setIsOpen(false);
                }}
                disabled={isDateDisabled}
                initialFocus
                onDayClick={(day) => {
                  // Ngăn chặn hành động nếu ngày bị disable
                  if (isDateDisabled(day)) {
                    return;
                  }
                }}
              />
            </div>
          )}
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        {isDemo && (
          <p className="text-xs text-amber-600 italic">
            * Chế độ demo: Cho phép chọn ngày quá khứ
          </p>
        )}
      </div>
    </div>
  );
}

// Define props for DateRangePicker
interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabled?: boolean;
  error?: string;
}

// DateRangePicker component
export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  label,
  minDate,
  maxDate,
  disabledDates = [],
  disabled = false,
  error,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isDemo } = useDemoMode();
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Kiểm tra disable dates
  const isDateDisabled = React.useCallback(
    (day: Date) => {
      // Nếu đang ở chế độ demo, không disable ngày quá khứ
      const isPastDate =
        !isDemo && isBefore(day, new Date()) && !isSameDay(day, new Date());

      // Kiểm tra minDate và maxDate
      const isBeforeMin = minDate ? isBefore(day, minDate) : false;
      const isAfterMax = maxDate ? isAfter(day, maxDate) : false;

      // Kiểm tra với disabledDates
      const isDisabledDate = disabledDates.some(
        (disabledDate) => isValid(disabledDate) && isSameDay(day, disabledDate)
      );

      return isPastDate || isBeforeMin || isAfterMax || isDisabledDate;
    },
    [isDemo, minDate, maxDate, disabledDates]
  );

  // Xử lý click ngoài
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        calendarRef.current &&
        buttonRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayText = React.useMemo(() => {
    if (!dateRange || !dateRange.from) return "Chọn khoảng thời gian";
    if (!dateRange.to)
      return format(dateRange.from, "dd/MM/yyyy", { locale: vi });
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: vi })} - ${format(
      dateRange.to,
      "dd/MM/yyyy",
      { locale: vi }
    )}`;
  }, [dateRange]);

  return (
    <div className="space-y-2">
      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          >
            <span className={!dateRange?.from ? "text-muted-foreground" : ""}>
              {displayText}
            </span>
            <CalendarIcon className="h-4 w-4 opacity-50" />
          </button>

          {isOpen && (
            <div
              ref={calendarRef}
              className="absolute z-50 mt-2 bg-popover shadow-md border rounded-md w-auto"
            >
              <EnhancedCalendar
                mode="range"
                selected={dateRange}
                onSelect={(selectedRange) => {
                  onDateRangeChange(selectedRange);
                  // Chỉ đóng khi chọn xong range (to)
                  if (selectedRange?.to) {
                    setIsOpen(false);
                  }
                }}
                disabled={isDateDisabled}
                initialFocus
              />
            </div>
          )}
        </div>
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        {isDemo && (
          <p className="text-xs text-amber-600 italic">
            * Chế độ demo: Cho phép chọn ngày quá khứ
          </p>
        )}
      </div>
    </div>
  );
}

export { EnhancedCalendar };
