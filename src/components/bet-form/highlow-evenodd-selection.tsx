// src/components/bet-form/highlow-evenodd-selection.tsx
"use client";

import { useBetContext } from "@/contexts/BetContext";
import { Button } from "@/components/ui/button";

export function HighLowEvenOddSelection() {
  const { methods } = useBetContext();
  const currentNumbers = methods.watch("numbers") || [];

  // Tạo danh sách số cho Tài/Xỉu và Chẵn/Lẻ
  const generateHighNumbers = () => {
    const numbers = [];
    for (let i = 50; i <= 99; i++) {
      numbers.push(i.toString().padStart(2, "0"));
    }
    return numbers;
  };

  const generateLowNumbers = () => {
    const numbers = [];
    for (let i = 0; i <= 49; i++) {
      numbers.push(i.toString().padStart(2, "0"));
    }
    return numbers;
  };

  const generateEvenNumbers = () => {
    const numbers = [];
    for (let i = 0; i <= 99; i += 2) {
      numbers.push(i.toString().padStart(2, "0"));
    }
    return numbers;
  };

  const generateOddNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= 99; i += 2) {
      numbers.push(i.toString().padStart(2, "0"));
    }
    return numbers;
  };

  // Thêm danh sách số vào form
  const addNumbers = (newNumbers: string[]) => {
    // Thêm các số không trùng lặp
    const updatedNumbers = [...currentNumbers];

    newNumbers.forEach((num) => {
      if (!updatedNumbers.includes(num)) {
        updatedNumbers.push(num);
      }
    });

    methods.setValue("numbers", updatedNumbers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-3">Tài - Xỉu</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => addNumbers(generateHighNumbers())}
            className="h-auto py-4"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Tài (50-99)</span>
              <span className="text-xs text-muted-foreground mt-1">
                50, 51, 52, ..., 99
              </span>
            </div>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addNumbers(generateLowNumbers())}
            className="h-auto py-4"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Xỉu (00-49)</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 01, 02, ..., 49
              </span>
            </div>
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">Chẵn - Lẻ</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => addNumbers(generateEvenNumbers())}
            className="h-auto py-4"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Chẵn</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 02, 04, ..., 98
              </span>
            </div>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => addNumbers(generateOddNumbers())}
            className="h-auto py-4"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Lẻ</span>
              <span className="text-xs text-muted-foreground mt-1">
                01, 03, 05, ..., 99
              </span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
