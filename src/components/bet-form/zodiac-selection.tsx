// src/components/bet-form/zodiac-selection.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { BetFormValues } from "@/lib/validators/bet-form-validator";

// Dữ liệu 12 con giáp và số tương ứng
const zodiacData = [
  {
    id: "ty",
    name: "Tý (Chuột)",
    numbers: ["00", "12", "24", "36", "48", "60", "72", "84", "96"],
  },
  {
    id: "suu",
    name: "Sửu (Trâu)",
    numbers: ["01", "13", "25", "37", "49", "61", "73", "85", "97"],
  },
  {
    id: "dan",
    name: "Dần (Hổ)",
    numbers: ["02", "14", "26", "38", "50", "62", "74", "86", "98"],
  },
  {
    id: "mao",
    name: "Mão (Mèo)",
    numbers: ["03", "15", "27", "39", "51", "63", "75", "87", "99"],
  },
  {
    id: "thin",
    name: "Thìn (Rồng)",
    numbers: ["04", "16", "28", "40", "52", "64", "76", "88"],
  },
  {
    id: "ti",
    name: "Tỵ (Rắn)",
    numbers: ["05", "17", "29", "41", "53", "65", "77", "89"],
  },
  {
    id: "ngo",
    name: "Ngọ (Ngựa)",
    numbers: ["06", "18", "30", "42", "54", "66", "78", "90"],
  },
  {
    id: "mui",
    name: "Mùi (Dê)",
    numbers: ["07", "19", "31", "43", "55", "67", "79", "91"],
  },
  {
    id: "than",
    name: "Thân (Khỉ)",
    numbers: ["08", "20", "32", "44", "56", "68", "80", "92"],
  },
  {
    id: "dau",
    name: "Dậu (Gà)",
    numbers: ["09", "21", "33", "45", "57", "69", "81", "93"],
  },
  {
    id: "tuat",
    name: "Tuất (Chó)",
    numbers: ["10", "22", "34", "46", "58", "70", "82", "94"],
  },
  {
    id: "hoi",
    name: "Hợi (Lợn)",
    numbers: ["11", "23", "35", "47", "59", "71", "83", "95"],
  },
];

export function ZodiacSelection() {
  const { setValue, watch } = useFormContext<BetFormValues>();
  const currentNumbers = watch("numbers") || [];

  // Hàm chọn con giáp
  const selectZodiac = (zodiac: (typeof zodiacData)[0]) => {
    // Thêm các số không trùng lặp
    const newNumbers = [...currentNumbers];

    zodiac.numbers.forEach((num) => {
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    });

    setValue("numbers", newNumbers);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm mb-2">Chọn con giáp để lấy tất cả số tương ứng</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {zodiacData.map((zodiac) => (
          <Button
            key={zodiac.id}
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => selectZodiac(zodiac)}
          >
            <div className="flex flex-col items-start">
              <span>{zodiac.name}</span>
              <span className="text-xs text-muted-foreground">
                {zodiac.numbers.join(", ")}
              </span>
            </div>
          </Button>
        ))}
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        <p>Mỗi con giáp có các số tương ứng theo quy tắc:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Tý: 00, 12, 24, 36, 48, 60, 72, 84, 96</li>
          <li>Sửu: 01, 13, 25, 37, 49, 61, 73, 85, 97</li>
          <li>v.v.</li>
        </ul>
      </div>
    </div>
  );
}
