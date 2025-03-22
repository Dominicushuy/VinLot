// src/app/bet/page.tsx
"use client";

import { BetForm } from "@/components/bet-form/bet-form";

export default function BetFormPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-lottery-primary">Đặt cược</h1>
      <BetForm />
    </div>
  );
}
