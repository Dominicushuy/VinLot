// src/components/bet-form/sequence-selection.tsx
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BetFormValues } from "@/lib/validators/bet-form-validator";

export function SequenceSelection() {
  const { setValue, watch } = useFormContext<BetFormValues>();
  const [sequenceType, setSequenceType] = useState<string>("tens");
  const [sequenceValue, setSequenceValue] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string[]>([]);

  const currentNumbers = watch("numbers") || [];

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
      // No input required
      setPreview(["00", "11", "22", "33", "44", "55", "66", "77", "88", "99"]);
    } else if (sequenceType === "progression") {
      // No input required
      setPreview(["01", "12", "23", "34", "45", "56", "67", "78", "89"]);
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

    setValue("numbers", newNumbers);
    setPreview([]);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm mb-3">Chọn kiểu kéo số</p>
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

      {(sequenceType === "doubles" || sequenceType === "progression") && (
        <div className="flex justify-end">
          <Button type="button" onClick={generateSequence}>
            Tạo dãy số
          </Button>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium">Dãy số ({preview.length})</p>
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
        <p>Giải thích kiểu kéo số:</p>
        <ul className="list-disc list-inside mt-1">
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
        </ul>
      </div>
    </div>
  );
}
