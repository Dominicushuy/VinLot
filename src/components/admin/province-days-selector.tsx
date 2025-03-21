// src/components/admin/province-days-selector.tsx

"use client";

import { Button } from "@/components/ui/button";

interface ProvinceDaysSelectorProps {
  value: string[];
  onChange: (days: string[]) => void;
}

const daysOfWeek = [
  { id: "thu-hai", label: "Thứ Hai" },
  { id: "thu-ba", label: "Thứ Ba" },
  { id: "thu-tu", label: "Thứ Tư" },
  { id: "thu-nam", label: "Thứ Năm" },
  { id: "thu-sau", label: "Thứ Sáu" },
  { id: "thu-bay", label: "Thứ Bảy" },
  { id: "chu-nhat", label: "Chủ Nhật" },
];

export function ProvinceDaysSelector({
  value = [],
  onChange,
}: ProvinceDaysSelectorProps) {
  const toggleDay = (dayId: string) => {
    if (value.includes(dayId)) {
      onChange(value.filter((id) => id !== dayId));
    } else {
      onChange([...value, dayId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {daysOfWeek.map((day) => (
          <Button
            key={day.id}
            type="button"
            variant={value.includes(day.id) ? "lottery" : "outline"}
            onClick={() => toggleDay(day.id)}
            className="min-w-[100px]"
          >
            {day.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
