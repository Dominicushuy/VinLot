// src/components/bet-form/bet-form-header.tsx
"use client";

import { useBetContext } from "@/contexts/BetContext";
import { DatePicker } from "@/components/ui/calendar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { useDemoMode } from "@/lib/hooks/use-demo-mode";
import { useEffect, useState } from "react";
import { isAfter } from "date-fns";

// Fake user data for demo purposes
const demoUser = {
  id: "3a652095-83ce-4c36-aa89-cef8bdeaf7c8",
  name: "Nguyễn Văn A",
  balance: 10000000, // 10 triệu VND
};

export function EnhancedBetFormHeader() {
  const { methods } = useBetContext();
  const { isDemo } = useDemoMode();

  // Date error state
  const [dateError, setDateError] = useState<string | null>(null);

  // Watch dates
  const betDate = methods.watch("betDate");
  const drawDate = methods.watch("drawDate");

  // Validate dates
  useEffect(() => {
    if (betDate && drawDate) {
      const betDateStart = new Date(betDate);
      const drawDateStart = new Date(drawDate);

      // Reset giờ, phút, giây để so sánh chỉ ngày
      betDateStart.setHours(0, 0, 0, 0);
      drawDateStart.setHours(0, 0, 0, 0);

      if (isAfter(betDateStart, drawDateStart)) {
        setDateError("Ngày đặt cược không thể sau ngày xổ số");
      } else {
        setDateError(null);
      }
    }
  }, [betDate, drawDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold">Thông tin cược</h2>

        {isDemo && (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-200"
          >
            Chế độ demo - Cho phép chọn ngày quá khứ
          </Badge>
        )}
      </div>

      {dateError && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-800"
        >
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Lỗi chọn ngày</AlertTitle>
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DatePicker
            label="Ngày đặt cược"
            date={betDate}
            onDateChange={(date) => {
              if (date) {
                methods.setValue("betDate", date);

                // Nếu drawDate hiện tại nhỏ hơn betDate mới, cập nhật drawDate
                if (drawDate && isAfter(date, drawDate)) {
                  methods.setValue("drawDate", date);
                }
              }
            }}
            error={methods.formState.errors.betDate?.message}
          />

          <DatePicker
            label="Ngày xổ số"
            date={drawDate}
            onDateChange={(date) => date && methods.setValue("drawDate", date)}
            minDate={betDate}
            error={methods.formState.errors.drawDate?.message}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Người chơi
            </label>
            <div className="p-4 border rounded-md bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-lottery-primary to-blue-400 flex items-center justify-center text-white font-bold">
                  {demoUser.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{demoUser.name}</p>
                  <p className="text-sm text-gray-500">ID: {demoUser.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Số dư hiện tại
            </label>
            <div className="p-4 border rounded-md bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Tài khoản:</p>
                <p className="text-xl font-bold text-lottery-primary">
                  {formatCurrency(demoUser.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
