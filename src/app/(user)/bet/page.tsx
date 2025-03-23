// src/app/(user)/bet/page-enhanced.tsx
"use client";

import { EnhancedBetForm } from "@/components/bet-form/enhanced-bet-form";

export default function EnhancedBetFormPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-lottery-primary">
            Đặt cược xổ số
          </h1>
          <p className="text-gray-600 mt-2">
            Đặt cược xổ số với nhiều loại cược và tỉnh/thành phố khác nhau
          </p>
        </div>

        <EnhancedBetForm />
      </div>
    </div>
  );
}
