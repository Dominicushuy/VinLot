// src/components/bet-form/highlow-evenodd-selection.tsx
"use client";

import { useBetContext } from "@/contexts/BetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Kiểm tra xem đã chọn bao nhiêu số trong mỗi nhóm
  const highNumbers = generateHighNumbers();
  const lowNumbers = generateLowNumbers();
  const evenNumbers = generateEvenNumbers();
  const oddNumbers = generateOddNumbers();

  const selectedHighCount = highNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedLowCount = lowNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedEvenCount = evenNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedOddCount = oddNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-3">Tài - Xỉu</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={selectedHighCount > 0 ? "lotterySecondary" : "outline"}
            onClick={() => addNumbers(generateHighNumbers())}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Tài (50-99)</span>
              <span className="text-xs text-muted-foreground mt-1">
                50, 51, 52, ..., 99
              </span>
            </div>

            {selectedHighCount > 0 && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedHighCount}/{highNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={selectedLowCount > 0 ? "lotterySecondary" : "outline"}
            onClick={() => addNumbers(generateLowNumbers())}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Xỉu (00-49)</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 01, 02, ..., 49
              </span>
            </div>

            {selectedLowCount > 0 && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedLowCount}/{lowNumbers.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">Chẵn - Lẻ</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={selectedEvenCount > 0 ? "lotterySecondary" : "outline"}
            onClick={() => addNumbers(generateEvenNumbers())}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Chẵn</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 02, 04, ..., 98
              </span>
            </div>

            {selectedEvenCount > 0 && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedEvenCount}/{evenNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={selectedOddCount > 0 ? "lotterySecondary" : "outline"}
            onClick={() => addNumbers(generateOddNumbers())}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Lẻ</span>
              <span className="text-xs text-muted-foreground mt-1">
                01, 03, 05, ..., 99
              </span>
            </div>

            {selectedOddCount > 0 && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedOddCount}/{oddNumbers.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium mb-3">Kết hợp</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const numbers = highNumbers.filter(
                (num) => parseInt(num) % 2 === 0
              );
              addNumbers(numbers);
            }}
            className="h-auto py-2"
          >
            <div className="text-xs">
              <span className="font-medium">Tài + Chẵn</span>
              <div className="text-muted-foreground">(50-98 chẵn)</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const numbers = highNumbers.filter(
                (num) => parseInt(num) % 2 !== 0
              );
              addNumbers(numbers);
            }}
            className="h-auto py-2"
          >
            <div className="text-xs">
              <span className="font-medium">Tài + Lẻ</span>
              <div className="text-muted-foreground">(51-99 lẻ)</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const numbers = lowNumbers.filter(
                (num) => parseInt(num) % 2 === 0
              );
              addNumbers(numbers);
            }}
            className="h-auto py-2"
          >
            <div className="text-xs">
              <span className="font-medium">Xỉu + Chẵn</span>
              <div className="text-muted-foreground">(00-48 chẵn)</div>
            </div>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const numbers = lowNumbers.filter(
                (num) => parseInt(num) % 2 !== 0
              );
              addNumbers(numbers);
            }}
            className="h-auto py-2"
          >
            <div className="text-xs">
              <span className="font-medium">Xỉu + Lẻ</span>
              <div className="text-muted-foreground">(01-49 lẻ)</div>
            </div>
          </Button>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border rounded-md mt-4">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Lưu ý:</span> Sử dụng các nút trên để
          thêm toàn bộ số vào danh sách chọn. Nếu muốn chọn từng số riêng lẻ,
          hãy sử dụng Bảng Số ở trên.
        </p>
      </div>
    </div>
  );
}
