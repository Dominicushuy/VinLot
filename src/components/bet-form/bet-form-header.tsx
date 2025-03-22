// src/components/bet-form/bet-form-header.tsx (cập nhật)
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BetFormValues } from "@/lib/validators/bet-form-validator";
import { CalendarIcon } from "lucide-react";

// Fake user data for demo purposes
const demoUser = {
  id: "3a652095-83ce-4c36-aa89-cef8bdeaf7c8",
  name: "Nguyễn Văn A",
  balance: 10000000, // 10 triệu VND
};

export function BetFormHeader() {
  const { setValue, watch } = useFormContext<BetFormValues>();
  const [betDateOpen, setBetDateOpen] = useState(false);
  const [drawDateOpen, setDrawDateOpen] = useState(false);

  const betDate = watch("betDate");
  const drawDate = watch("drawDate");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Thông tin cược</h2>

        {/* Thêm badge thông báo chế độ demo */}
        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
          Chế độ demo - Cho phép chọn ngày quá khứ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày đặt cược
            </label>
            <Popover open={betDateOpen} onOpenChange={setBetDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {betDate ? (
                    format(betDate, "EEEE, dd/MM/yyyy", { locale: vi })
                  ) : (
                    <span>Chọn ngày đặt cược</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={betDate}
                  onSelect={(date) => {
                    setValue("betDate", date || new Date());
                    setBetDateOpen(false);
                  }}
                  // Đã loại bỏ hạn chế ngày quá khứ
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày xổ số
            </label>
            <Popover open={drawDateOpen} onOpenChange={setDrawDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {drawDate ? (
                    format(drawDate, "EEEE, dd/MM/yyyy", { locale: vi })
                  ) : (
                    <span>Chọn ngày xổ số</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={drawDate}
                  onSelect={(date) => {
                    setValue("drawDate", date || new Date());
                    setDrawDateOpen(false);
                  }}
                  // Đã loại bỏ hạn chế ngày quá khứ
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Người chơi
            </label>
            <div className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium">{demoUser.name}</p>
              <p className="text-sm text-gray-500">ID: {demoUser.id}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số dư hiện tại
            </label>
            <div className="p-3 border rounded-md bg-gray-50">
              <p className="font-medium text-lottery-primary">
                {formatCurrency(demoUser.balance)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
