// src/components/bet-form/permutation-selection.tsx
"use client";

import { useState } from "react";
import { useBetContext } from "@/contexts/BetContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generatePermutations } from "@/lib/utils";

interface PermutationSelectionProps {
  digitCount: number;
}

export function PermutationSelection({
  digitCount,
}: PermutationSelectionProps) {
  const { methods } = useBetContext();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  const currentNumbers = methods.watch("numbers") || [];

  // Xử lý tạo hoán vị
  const handleGeneratePermutations = () => {
    // Kiểm tra giá trị nhập
    if (!inputValue) {
      setError("Vui lòng nhập số gốc");
      return;
    }

    // Kiểm tra định dạng số
    if (!/^\d+$/.test(inputValue)) {
      setError("Số gốc phải chỉ bao gồm các chữ số");
      return;
    }

    // Kiểm tra độ dài số
    if (inputValue.length !== digitCount) {
      setError(`Số gốc phải có ${digitCount} chữ số`);
      return;
    }

    // Tạo hoán vị
    const permutations = generatePermutations(inputValue);
    setPreview(permutations);
    setError("");
  };

  // Xác nhận chọn các hoán vị
  const confirmSelection = () => {
    if (preview.length === 0) return;

    // Thêm các số không trùng lặp
    const newNumbers = [...currentNumbers];

    preview.forEach((num) => {
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    });

    methods.setValue("numbers", newNumbers);
    setPreview([]);
    setInputValue("");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm mb-2">
          Nhập số gốc {digitCount} chữ số để tạo các hoán vị
        </p>
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
              setPreview([]);
            }}
            placeholder={`Nhập ${digitCount} chữ số`}
            maxLength={digitCount}
            className="flex-1"
          />
          <Button type="button" onClick={handleGeneratePermutations}>
            Tạo hoán vị
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {preview.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Các hoán vị ({preview.length})</p>
            <Button type="button" size="sm" onClick={confirmSelection}>
              Thêm tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preview.map((number, index) => (
              <div key={index} className="px-3 py-1 bg-white border rounded-md">
                {number}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>Ví dụ về đảo số:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Số &quot;12&quot; có các hoán vị: 12, 21</li>
          <li>
            Số &quot;123&quot; có các hoán vị: 123, 132, 213, 231, 312, 321
          </li>
          <li>Số có các chữ số trùng nhau sẽ có ít hoán vị hơn</li>
        </ul>
      </div>
    </div>
  );
}
