// src/components/bet-form/highlow-evenodd-selection.tsx
"use client";

import { useBetContext } from "@/contexts/BetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function HighLowEvenOddSelection() {
  const { methods } = useBetContext();
  const currentNumbers = methods.watch("numbers") || [];

  // State để lưu trạng thái filter
  const [activeFilters, setActiveFilters] = useState<{
    highLow: "high" | "low" | null;
    evenOdd: "even" | "odd" | null;
  }>({
    highLow: null,
    evenOdd: null,
  });

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

  // Kết hợp bộ lọc để tạo danh sách số
  const getCombinedNumbers = (
    highLow: "high" | "low" | null,
    evenOdd: "even" | "odd" | null
  ) => {
    // Base set based on high/low
    let baseNumbers: string[] = [];
    if (highLow === "high") {
      baseNumbers = generateHighNumbers();
    } else if (highLow === "low") {
      baseNumbers = generateLowNumbers();
    } else {
      return []; // Không có bộ lọc nào được chọn
    }

    // Filter by even/odd if selected
    if (evenOdd === "even") {
      return baseNumbers.filter((num) => parseInt(num) % 2 === 0);
    } else if (evenOdd === "odd") {
      return baseNumbers.filter((num) => parseInt(num) % 2 !== 0);
    }

    // No even/odd filter
    return baseNumbers;
  };

  // Toggle bộ lọc và thêm/xóa số tương ứng
  const toggleFilter = (
    type: "highLow" | "evenOdd",
    value: "high" | "low" | "even" | "odd"
  ) => {
    // Cập nhật state bộ lọc
    const newFilters = { ...activeFilters };

    if (type === "highLow") {
      // Toggle high/low
      newFilters.highLow =
        newFilters.highLow === value ? null : (value as "high" | "low");
    } else {
      // Toggle even/odd
      newFilters.evenOdd =
        newFilters.evenOdd === value ? null : (value as "even" | "odd");
    }

    setActiveFilters(newFilters);

    // Lấy danh sách số dựa trên bộ lọc mới
    const filteredNumbers = getCombinedNumbers(
      newFilters.highLow,
      newFilters.evenOdd
    );

    // Kiểm tra xem tất cả số đã được chọn chưa
    const allSelected =
      filteredNumbers.length > 0 &&
      filteredNumbers.every((num) => currentNumbers.includes(num));

    if (allSelected) {
      // Nếu tất cả đã được chọn, bỏ chọn hết
      methods.setValue(
        "numbers",
        currentNumbers.filter((num) => !filteredNumbers.includes(num))
      );
    } else if (filteredNumbers.length > 0) {
      // Thêm các số chưa được chọn
      const newNumbers = [...currentNumbers];
      filteredNumbers.forEach((num) => {
        if (!newNumbers.includes(num)) {
          newNumbers.push(num);
        }
      });
      methods.setValue("numbers", newNumbers);
    }
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

  // Tạo số cho các kết hợp cố định
  const addCombination = (highLow: "high" | "low", evenOdd: "even" | "odd") => {
    const numbers = getCombinedNumbers(highLow, evenOdd);

    // Kiểm tra xem đã chọn hết tổ hợp này chưa
    const allSelected =
      numbers.length > 0 &&
      numbers.every((num) => currentNumbers.includes(num));

    if (allSelected) {
      // Nếu đã chọn hết, bỏ chọn tất cả
      methods.setValue(
        "numbers",
        currentNumbers.filter((num) => !numbers.includes(num))
      );
    } else {
      addNumbers(numbers);
    }
  };

  // Kiểm tra xem đã chọn bao nhiêu số trong mỗi nhóm
  const highNumbers = generateHighNumbers();
  const lowNumbers = generateLowNumbers();
  const evenNumbers = generateEvenNumbers();
  const oddNumbers = generateOddNumbers();

  // Các tổ hợp
  const highEvenNumbers = highNumbers.filter((num) => parseInt(num) % 2 === 0);
  const highOddNumbers = highNumbers.filter((num) => parseInt(num) % 2 !== 0);
  const lowEvenNumbers = lowNumbers.filter((num) => parseInt(num) % 2 === 0);
  const lowOddNumbers = lowNumbers.filter((num) => parseInt(num) % 2 !== 0);

  // Đếm số lượng đã chọn
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

  const selectedHighEvenCount = highEvenNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedHighOddCount = highOddNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedLowEvenCount = lowEvenNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;
  const selectedLowOddCount = lowOddNumbers.filter((num) =>
    currentNumbers.includes(num)
  ).length;

  // Kiểm tra đã chọn đủ
  const isHighSelected = selectedHighCount === highNumbers.length;
  const isLowSelected = selectedLowCount === lowNumbers.length;
  const isEvenSelected = selectedEvenCount === evenNumbers.length;
  const isOddSelected = selectedOddCount === oddNumbers.length;

  const isHighEvenSelected = selectedHighEvenCount === highEvenNumbers.length;
  const isHighOddSelected = selectedHighOddCount === highOddNumbers.length;
  const isLowEvenSelected = selectedLowEvenCount === lowEvenNumbers.length;
  const isLowOddSelected = selectedLowOddCount === lowOddNumbers.length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-3">Tài - Xỉu</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={
              activeFilters.highLow === "high" || isHighSelected
                ? "lottery"
                : "outline"
            }
            onClick={() => toggleFilter("highLow", "high")}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Tài (50-99)</span>
              <span className="text-xs text-muted-foreground mt-1">
                50, 51, 52, ..., 99
              </span>
            </div>

            {selectedHighCount > 0 &&
              selectedHighCount < highNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedHighCount}/{highNumbers.length}
                </Badge>
              )}

            {isHighSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedHighCount}/{highNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={
              activeFilters.highLow === "low" || isLowSelected
                ? "lottery"
                : "outline"
            }
            onClick={() => toggleFilter("highLow", "low")}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Xỉu (00-49)</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 01, 02, ..., 49
              </span>
            </div>

            {selectedLowCount > 0 && selectedLowCount < lowNumbers.length && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedLowCount}/{lowNumbers.length}
              </Badge>
            )}

            {isLowSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
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
            variant={
              activeFilters.evenOdd === "even" || isEvenSelected
                ? "lottery"
                : "outline"
            }
            onClick={() => toggleFilter("evenOdd", "even")}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Chẵn</span>
              <span className="text-xs text-muted-foreground mt-1">
                00, 02, 04, ..., 98
              </span>
            </div>

            {selectedEvenCount > 0 &&
              selectedEvenCount < evenNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedEvenCount}/{evenNumbers.length}
                </Badge>
              )}

            {isEvenSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedEvenCount}/{evenNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={
              activeFilters.evenOdd === "odd" || isOddSelected
                ? "lottery"
                : "outline"
            }
            onClick={() => toggleFilter("evenOdd", "odd")}
            className="h-auto py-4 relative"
          >
            <div className="text-left flex flex-col items-start">
              <span className="font-bold">Lẻ</span>
              <span className="text-xs text-muted-foreground mt-1">
                01, 03, 05, ..., 99
              </span>
            </div>

            {selectedOddCount > 0 && selectedOddCount < oddNumbers.length && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-xs"
              >
                {selectedOddCount}/{oddNumbers.length}
              </Badge>
            )}

            {isOddSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
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
            variant={isHighEvenSelected ? "lottery" : "outline"}
            size="sm"
            onClick={() => addCombination("high", "even")}
            className="h-auto py-2 relative"
          >
            <div className="text-xs">
              <span className="font-medium">Tài + Chẵn</span>
              <div className="text-muted-foreground">(50-98 chẵn)</div>
            </div>

            {selectedHighEvenCount > 0 &&
              selectedHighEvenCount < highEvenNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedHighEvenCount}/{highEvenNumbers.length}
                </Badge>
              )}

            {isHighEvenSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedHighEvenCount}/{highEvenNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={isHighOddSelected ? "lottery" : "outline"}
            size="sm"
            onClick={() => addCombination("high", "odd")}
            className="h-auto py-2 relative"
          >
            <div className="text-xs">
              <span className="font-medium">Tài + Lẻ</span>
              <div className="text-muted-foreground">(51-99 lẻ)</div>
            </div>

            {selectedHighOddCount > 0 &&
              selectedHighOddCount < highOddNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedHighOddCount}/{highOddNumbers.length}
                </Badge>
              )}

            {isHighOddSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedHighOddCount}/{highOddNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={isLowEvenSelected ? "lottery" : "outline"}
            size="sm"
            onClick={() => addCombination("low", "even")}
            className="h-auto py-2 relative"
          >
            <div className="text-xs">
              <span className="font-medium">Xỉu + Chẵn</span>
              <div className="text-muted-foreground">(00-48 chẵn)</div>
            </div>

            {selectedLowEvenCount > 0 &&
              selectedLowEvenCount < lowEvenNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedLowEvenCount}/{lowEvenNumbers.length}
                </Badge>
              )}

            {isLowEvenSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedLowEvenCount}/{lowEvenNumbers.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant={isLowOddSelected ? "lottery" : "outline"}
            size="sm"
            onClick={() => addCombination("low", "odd")}
            className="h-auto py-2 relative"
          >
            <div className="text-xs">
              <span className="font-medium">Xỉu + Lẻ</span>
              <div className="text-muted-foreground">(01-49 lẻ)</div>
            </div>

            {selectedLowOddCount > 0 &&
              selectedLowOddCount < lowOddNumbers.length && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedLowOddCount}/{lowOddNumbers.length}
                </Badge>
              )}

            {isLowOddSelected && (
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
              >
                {selectedLowOddCount}/{lowOddNumbers.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="p-3 bg-gray-50 border rounded-md mt-4">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Lưu ý:</span> Nhấn lần nữa vào bộ lọc đã
          chọn để bỏ chọn các số tương ứng. Bạn cũng có thể kết hợp Tài/Xỉu với
          Chẵn/Lẻ để lọc nhanh.
        </p>
      </div>
    </div>
  );
}
