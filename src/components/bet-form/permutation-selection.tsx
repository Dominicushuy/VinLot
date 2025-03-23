// src/components/bet-form/permutation-selection.tsx
"use client";

import { useState, useEffect } from "react";
import { useBetContext } from "@/contexts/BetContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generatePermutations } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [recentPermutations, setRecentPermutations] = useState<string[][]>([]);

  const currentNumbers = methods.watch("numbers") || [];

  // Reset when digitCount changes
  useEffect(() => {
    setInputValue("");
    setError("");
    setPreview([]);
    setSuccessMessage(null);
  }, [digitCount]);

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

    // Kiểm tra trường hợp tất cả chữ số giống nhau
    if (new Set(inputValue.split("")).size === 1) {
      // const single = [...inputValue];
      setPreview([inputValue]);
      setError("");

      // Thêm vào lịch sử
      addToRecentPermutations([inputValue]);

      return;
    }

    // Tạo hoán vị
    const permutations = generatePermutations(inputValue);
    setPreview(permutations);
    setError("");

    // Thêm vào lịch sử hoán vị gần đây
    addToRecentPermutations(permutations);
  };

  // Thêm vào lịch sử hoán vị gần đây
  const addToRecentPermutations = (permutations: string[]) => {
    // Giới hạn 3 nhóm hoán vị gần đây
    const newRecent = [permutations, ...recentPermutations.slice(0, 2)];
    setRecentPermutations(newRecent);
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
    setSuccessMessage(`Đã thêm ${preview.length} số vào danh sách`);

    // Xóa thông báo sau 3 giây
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Kiểm tra số lượng số đã chọn trong preview
  const selectedPreviewCount = preview.filter((num) =>
    currentNumbers.includes(num)
  ).length;

  // Tính toán số hoán vị tối đa
  const getMaxPermutations = (number: string) => {
    const uniqueDigits = new Set(number.split("")).size;
    if (uniqueDigits === 1) return 1;

    let result = 1;
    for (let i = 2; i <= uniqueDigits; i++) {
      result *= i;
    }

    // Xử lý trường hợp có chữ số trùng lặp
    const digitCounts: { [key: string]: number } = {};
    number.split("").forEach((digit) => {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    });

    // Chia cho giai thừa của số lần lặp lại
    Object.values(digitCounts).forEach((count) => {
      if (count > 1) {
        let factorial = 1;
        for (let i = 2; i <= count; i++) {
          factorial *= i;
        }
        result /= factorial;
      }
    });

    return result;
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
              setSuccessMessage(null);
            }}
            placeholder={`Nhập ${digitCount} chữ số`}
            maxLength={digitCount}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleGeneratePermutations}
            disabled={!inputValue || inputValue.length !== digitCount}
          >
            Tạo hoán vị
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {successMessage && (
          <div className="mt-1 text-sm text-green-600 flex items-center">
            <Check className="h-3 w-3 mr-1" /> {successMessage}
          </div>
        )}

        {inputValue && inputValue.length === digitCount && (
          <div className="mt-2 text-xs text-gray-500">
            Sẽ tạo ra khoảng {getMaxPermutations(inputValue)} hoán vị khác nhau
          </div>
        )}
      </div>

      {preview.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Các hoán vị ({preview.length})</p>
            <div className="flex gap-2">
              {selectedPreviewCount > 0 &&
                selectedPreviewCount < preview.length && (
                  <Badge variant="outline" className="bg-white text-xs">
                    {selectedPreviewCount}/{preview.length} đã chọn
                  </Badge>
                )}

              <Button
                type="button"
                size="sm"
                onClick={confirmSelection}
                variant={
                  selectedPreviewCount === preview.length
                    ? "outline"
                    : "lottery"
                }
                disabled={selectedPreviewCount === preview.length}
              >
                {selectedPreviewCount === preview.length ? (
                  <span className="flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Đã thêm tất cả
                  </span>
                ) : (
                  "Thêm tất cả"
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {preview.map((number, index) => (
              <Badge
                key={index}
                variant={
                  currentNumbers.includes(number) ? "lottery" : "outline"
                }
                className="cursor-pointer"
                onClick={() => {
                  // Toggle this number in the selected numbers
                  if (currentNumbers.includes(number)) {
                    methods.setValue(
                      "numbers",
                      currentNumbers.filter((n) => n !== number)
                    );
                  } else {
                    methods.setValue("numbers", [...currentNumbers, number]);
                  }
                }}
              >
                {number}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị lịch sử hoán vị gần đây */}
      {recentPermutations.length > 0 && recentPermutations[0] !== preview && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Hoán vị gần đây</h3>
          <div className="space-y-2">
            {recentPermutations.map((permGroup, groupIndex) => (
              <div
                key={groupIndex}
                className="p-2 bg-gray-50 rounded-md border flex items-center justify-between cursor-pointer hover:bg-gray-100"
                onClick={() => setPreview(permGroup)}
              >
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">
                    {permGroup[0].length}D: {permGroup[0].charAt(0)}...
                    <ArrowRight className="inline h-3 w-3 mx-1" />
                    {permGroup.length} hoán vị
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(permGroup);
                  }}
                >
                  Xem lại
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>Ví dụ về đảo số:</p>
        <ul className="list-disc list-inside mt-1 text-xs space-y-1">
          <li>Số &quot;12&quot; có các hoán vị: 12, 21</li>
          <li>
            Số &quot;123&quot; có các hoán vị: 123, 132, 213, 231, 312, 321
          </li>
          <li>Số &quot;112&quot; có các hoán vị: 112, 121, 211</li>
          <li>Số có các chữ số giống nhau (ví dụ: 111) sẽ chỉ có 1 hoán vị</li>
        </ul>
      </div>
    </div>
  );
}
