// src/components/bet-form/sequence-selection.tsx
"use client";

import { useState } from "react";
import { useBetContext } from "@/contexts/BetContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function SequenceSelection() {
  const { methods } = useBetContext();
  const [sequenceType, setSequenceType] = useState<string>("tens");
  const [sequenceValue, setSequenceValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string[]>([]);

  const currentNumbers = methods.watch("numbers") || [];

  // Generate sequence based on type and value
  const generateSequence = () => {
    setError("");
    setPreview([]);

    if (sequenceType === "tens") {
      // Validate input
      if (!/^[0-9]$/.test(sequenceValue)) {
        setError("Vui lòng nhập 1 chữ số từ 0-9");
        return;
      }

      // Generate sequence
      const tens = parseInt(sequenceValue);
      const numbers = [];
      for (let i = 0; i <= 9; i++) {
        numbers.push(`${tens}${i}`);
      }
      setPreview(numbers);
    } else if (sequenceType === "units") {
      // Validate input
      if (!/^[0-9]$/.test(sequenceValue)) {
        setError("Vui lòng nhập 1 chữ số từ 0-9");
        return;
      }

      // Generate sequence
      const units = parseInt(sequenceValue);
      const numbers = [];
      for (let i = 0; i <= 9; i++) {
        numbers.push(`${i}${units}`);
      }
      setPreview(numbers);
    } else if (sequenceType === "doubles") {
      // No input required for these predefined sequences
      setPreview(["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"]);
    } else if (sequenceType === "progression") {
      setPreview(["01", "12", "23", "34", "45", "56", "67", "78", "89"]);
    } else if (sequenceType === "custom") {
      // Custom sequence - define your own logic here
      // Ví dụ: Tạo dãy các số có tổng là 9
      const numbers = [];
      for (let i = 0; i <= 9; i++) {
        const j = 9 - i;
        if (j >= 0 && j <= 9) {
          numbers.push(`${i}${j}`);
        }
      }
      setPreview(numbers);
    }
  };

  // Confirm sequence selection
  const confirmSelection = () => {
    if (preview.length === 0) return;

    // Add non-duplicate numbers
    const newNumbers = [...currentNumbers];

    preview.forEach((num) => {
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    });

    methods.setValue("numbers", newNumbers);
    setPreview([]);
  };

  // Get number of already selected numbers from the current preview
  const selectedPreviewCount = preview.filter((num) =>
    currentNumbers.includes(num)
  ).length;

  // Predefined sequences for quick access
  const predefinedSequences = [
    {
      name: "Số đôi",
      description: "Các số có 2 chữ số giống nhau",
      values: ["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"],
    },
    {
      name: "Số tiến",
      description: "Các số có chữ số liên tiếp tăng",
      values: ["01", "12", "23", "34", "45", "56", "67", "78", "89"],
    },
    {
      name: "Số lùi",
      description: "Các số có chữ số liên tiếp giảm",
      values: ["10", "21", "32", "43", "54", "65", "76", "87", "98"],
    },
    {
      name: "Tổng bằng 9",
      description: "Các số có tổng 2 chữ số bằng 9",
      values: ["09", "18", "27", "36", "45", "54", "63", "72", "81", "90"],
    },
    {
      name: "Kéo hình chữ X",
      description: "Các số nằm trên hai đường chéo của bảng số 10x10",
      values: [
        "00",
        "11",
        "22",
        "33",
        "44",
        "55",
        "66",
        "77",
        "88",
        "99",
        "09",
        "18",
        "27",
        "36",
        "45",
        "54",
        "63",
        "72",
        "81",
        "90",
      ],
    },
  ];

  // Add a predefined sequence to the selected numbers
  const addPredefinedSequence = (values: string[]) => {
    const newNumbers = [...currentNumbers];

    values.forEach((num) => {
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    });

    methods.setValue("numbers", newNumbers);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Chọn kiểu kéo số</p>
        <Select
          value={sequenceType}
          onValueChange={(value) => {
            setSequenceType(value);
            setSequenceValue("");
            setPreview([]);
            setError("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn kiểu kéo số" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tens">Kéo chục</SelectItem>
            <SelectItem value="units">Kéo đơn vị</SelectItem>
            <SelectItem value="doubles">Số đôi</SelectItem>
            <SelectItem value="progression">Số tiến</SelectItem>
            <SelectItem value="custom">Tổng bằng 9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(sequenceType === "tens" || sequenceType === "units") && (
        <div>
          <p className="text-sm mb-2">
            {sequenceType === "tens"
              ? "Chọn hàng chục (0-9)"
              : "Chọn hàng đơn vị (0-9)"}
          </p>
          <div className="flex space-x-2">
            <Input
              value={sequenceValue}
              onChange={(e) => {
                setSequenceValue(e.target.value);
                setError("");
              }}
              placeholder={
                sequenceType === "tens" ? "Nhập chục" : "Nhập đơn vị"
              }
              maxLength={1}
              className="flex-1"
            />
            <Button type="button" onClick={generateSequence}>
              Tạo dãy số
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      )}

      {(sequenceType === "doubles" ||
        sequenceType === "progression" ||
        sequenceType === "custom") && (
        <div className="flex justify-end">
          <Button type="button" onClick={generateSequence}>
            Tạo dãy số
          </Button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Dãy số ({preview.length})</p>
            <div className="flex gap-2">
              {selectedPreviewCount > 0 &&
                selectedPreviewCount < preview.length && (
                  <Badge variant="outline" className="bg-white text-xs">
                    {selectedPreviewCount}/{preview.length} đã chọn
                  </Badge>
                )}
              <Button type="button" size="sm" onClick={confirmSelection}>
                Thêm tất cả
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

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-3">Các dãy số phổ biến</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {predefinedSequences.map((sequence, index) => {
            // Calculate how many numbers in this sequence are already selected
            const selectedCount = sequence.values.filter((num) =>
              currentNumbers.includes(num)
            ).length;

            const isFullySelected = selectedCount === sequence.values.length;
            const isPartiallySelected = selectedCount > 0 && !isFullySelected;

            return (
              <Button
                key={index}
                type="button"
                variant={
                  isFullySelected
                    ? "lottery"
                    : isPartiallySelected
                    ? "lotterySecondary"
                    : "outline"
                }
                className="h-auto py-2 justify-start relative"
                onClick={() => addPredefinedSequence(sequence.values)}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">{sequence.name}</div>
                  <div className="text-xs mt-1 opacity-80">
                    {sequence.description}
                  </div>
                </div>

                {isPartiallySelected && (
                  <Badge
                    variant="outline"
                    className="absolute -top-2 -right-2 bg-white text-xs"
                  >
                    {selectedCount}/{sequence.values.length}
                  </Badge>
                )}

                {isFullySelected && (
                  <Badge
                    variant="outline"
                    className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
                  >
                    {selectedCount}/{sequence.values.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-muted-foreground mt-6">
        <p>Giải thích kiểu kéo số:</p>
        <ul className="list-disc list-inside mt-1 text-xs space-y-1">
          <li>
            <b>Kéo chục:</b> Tạo 10 số có cùng hàng chục (Ví dụ: 20, 21, 22,
            ..., 29)
          </li>
          <li>
            <b>Kéo đơn vị:</b> Tạo 10 số có cùng hàng đơn vị (Ví dụ: 00, 10, 20,
            ..., 90)
          </li>
          <li>
            <b>Số đôi:</b> Các số có 2 chữ số giống nhau (00, 11, ..., 99)
          </li>
          <li>
            <b>Số tiến:</b> Các số có 2 chữ số liên tiếp tăng dần (01, 12, ...,
            89)
          </li>
          <li>
            <b>Tổng bằng 9:</b> Các số có tổng 2 chữ số bằng 9 (09, 18, ..., 90)
          </li>
        </ul>
      </div>
    </div>
  );
}
