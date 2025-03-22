// src/components/bet-form/bet-number-input.tsx (cập nhật)
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BetFormValues,
  validateBetNumbers,
} from "@/lib/validators/bet-form-validator";
import { Badge } from "@/components/ui/badge";

interface BetNumberInputProps {
  digitCount: number;
}

export function BetNumberInput({ digitCount }: BetNumberInputProps) {
  const { setValue, watch } = useFormContext<BetFormValues>();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const betType = watch("betType");
  const betVariant = watch("betVariant");
  const numbers = watch("numbers") || [];

  // Xử lý khi thêm số
  const handleAddNumber = () => {
    // Xóa khoảng trắng và split theo dấu phẩy
    const newNumbers = inputValue
      .replace(/\s/g, "")
      .split(",")
      .filter(Boolean)
      .map((n) => n.padStart(digitCount, "0"));

    if (newNumbers.length === 0) {
      setError("Vui lòng nhập ít nhất một số");
      return;
    }

    // Kiểm tra định dạng số
    if (!validateBetNumbers(newNumbers, betType, betVariant)) {
      setError(`Số không hợp lệ. Vui lòng nhập số có ${digitCount} chữ số`);
      return;
    }

    // Thêm các số mới không trùng lặp
    const updatedNumbers = [...numbers];

    newNumbers.forEach((number) => {
      if (!updatedNumbers.includes(number)) {
        updatedNumbers.push(number);
      }
    });

    setValue("numbers", updatedNumbers);
    setInputValue("");
    setError("");
  };

  // Xóa một số
  const removeNumber = (numberToRemove: string) => {
    setValue(
      "numbers",
      numbers.filter((n) => n !== numberToRemove)
    );
  };

  // Xóa tất cả số
  const clearAllNumbers = () => {
    setValue("numbers", []);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            placeholder={`Nhập ${digitCount} chữ số, cách nhau bởi dấu phẩy`}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddNumber();
              }
            }}
          />
          <Button type="button" onClick={handleAddNumber}>
            Thêm
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <div className="text-sm text-muted-foreground mb-2">
          Bảng số (Nhấn vào số để chọn/bỏ chọn)
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: Math.min(100, 10 ** digitCount) }).map(
            (_, i) => {
              const num = i.toString().padStart(digitCount, "0");
              const isSelected = numbers.includes(num);

              return (
                <button
                  key={i}
                  type="button"
                  className={`p-1 text-center border rounded ${
                    isSelected
                      ? "bg-lottery-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      removeNumber(num);
                    } else {
                      setValue("numbers", [...numbers, num]);
                    }
                  }}
                >
                  {num}
                </button>
              );
            }
          )}
        </div>
      </div>

      {numbers.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">
              Đã chọn {numbers.length} số
            </div>
            <Button variant="ghost" size="sm" onClick={clearAllNumbers}>
              Xóa tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
            {numbers.map((number) => (
              <Badge
                key={number}
                variant="outline"
                className="bg-white flex items-center"
              >
                {number}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-red-500"
                  onClick={() => removeNumber(number)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
