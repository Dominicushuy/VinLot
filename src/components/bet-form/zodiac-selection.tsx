// src/components/bet-form/zodiac-selection.tsx
"use client";

import { useBetContext } from "@/contexts/BetContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Dữ liệu 12 con giáp và số tương ứng
const zodiacData = [
  {
    id: "ty",
    name: "Tý (Chuột)",
    description:
      "Năm sinh: 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020",
    numbers: ["00", "12", "24", "36", "48", "60", "72", "84", "96"],
  },
  {
    id: "suu",
    name: "Sửu (Trâu)",
    description:
      "Năm sinh: 1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021",
    numbers: ["01", "13", "25", "37", "49", "61", "73", "85", "97"],
  },
  {
    id: "dan",
    name: "Dần (Hổ)",
    description:
      "Năm sinh: 1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022",
    numbers: ["02", "14", "26", "38", "50", "62", "74", "86", "98"],
  },
  {
    id: "mao",
    name: "Mão (Mèo)",
    description:
      "Năm sinh: 1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023",
    numbers: ["03", "15", "27", "39", "51", "63", "75", "87", "99"],
  },
  {
    id: "thin",
    name: "Thìn (Rồng)",
    description:
      "Năm sinh: 1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024",
    numbers: ["04", "16", "28", "40", "52", "64", "76", "88"],
  },
  {
    id: "ti",
    name: "Tỵ (Rắn)",
    description:
      "Năm sinh: 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025",
    numbers: ["05", "17", "29", "41", "53", "65", "77", "89"],
  },
  {
    id: "ngo",
    name: "Ngọ (Ngựa)",
    description:
      "Năm sinh: 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026",
    numbers: ["06", "18", "30", "42", "54", "66", "78", "90"],
  },
  {
    id: "mui",
    name: "Mùi (Dê)",
    description:
      "Năm sinh: 1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027",
    numbers: ["07", "19", "31", "43", "55", "67", "79", "91"],
  },
  {
    id: "than",
    name: "Thân (Khỉ)",
    description:
      "Năm sinh: 1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016, 2028",
    numbers: ["08", "20", "32", "44", "56", "68", "80", "92"],
  },
  {
    id: "dau",
    name: "Dậu (Gà)",
    description:
      "Năm sinh: 1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017, 2029",
    numbers: ["09", "21", "33", "45", "57", "69", "81", "93"],
  },
  {
    id: "tuat",
    name: "Tuất (Chó)",
    description:
      "Năm sinh: 1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018, 2030",
    numbers: ["10", "22", "34", "46", "58", "70", "82", "94"],
  },
  {
    id: "hoi",
    name: "Hợi (Lợn)",
    description:
      "Năm sinh: 1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019, 2031",
    numbers: ["11", "23", "35", "47", "59", "71", "83", "95"],
  },
];

export function ZodiacSelection() {
  const { methods } = useBetContext();
  const currentNumbers = methods.watch("numbers") || [];
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);

  // Hàm chọn con giáp
  const selectZodiac = (zodiac: (typeof zodiacData)[0]) => {
    // Thêm các số không trùng lặp
    const newNumbers = [...currentNumbers];

    zodiac.numbers.forEach((num) => {
      if (!newNumbers.includes(num)) {
        newNumbers.push(num);
      }
    });

    methods.setValue("numbers", newNumbers);
    setSelectedZodiac(zodiac.id);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm mb-2">Chọn con giáp để thêm các số tương ứng</p>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {zodiacData.map((zodiac) => {
          // Tính số lượng số đã chọn cho con giáp này
          const selectedCount = zodiac.numbers.filter((num) =>
            currentNumbers.includes(num)
          ).length;

          const isFullySelected = selectedCount === zodiac.numbers.length;
          const isPartiallySelected = selectedCount > 0 && !isFullySelected;

          return (
            <Button
              key={zodiac.id}
              type="button"
              variant={
                isFullySelected
                  ? "lottery"
                  : isPartiallySelected
                  ? "lotterySecondary"
                  : "outline"
              }
              className="flex-col h-auto py-2 px-3 relative"
              onClick={() => selectZodiac(zodiac)}
              title={zodiac.description}
            >
              <span className="text-sm font-medium mb-1">
                {zodiac.name.split(" ")[0]}
              </span>
              <span className="text-xs opacity-75">
                {zodiac.name.split(" ")[1]?.replace(/[()]/g, "")}
              </span>

              {isPartiallySelected && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-xs"
                >
                  {selectedCount}/{zodiac.numbers.length}
                </Badge>
              )}

              {isFullySelected && (
                <Badge
                  variant="outline"
                  className="absolute -top-2 -right-2 bg-white text-green-600 border-green-200 text-xs"
                >
                  {selectedCount}/{zodiac.numbers.length}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Chi tiết cho con giáp đã chọn */}
      {selectedZodiac && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">
              {zodiacData.find((z) => z.id === selectedZodiac)?.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setSelectedZodiac(null)}
            >
              Ẩn chi tiết
            </Button>
          </div>

          <div className="text-sm">
            <p className="mb-2">
              {zodiacData.find((z) => z.id === selectedZodiac)?.description}
            </p>
            <p className="font-medium mb-1">Các số tương ứng:</p>
            <div className="flex flex-wrap gap-1">
              {zodiacData
                .find((z) => z.id === selectedZodiac)
                ?.numbers.map((num) => (
                  <Badge
                    key={num}
                    variant={
                      currentNumbers.includes(num) ? "lottery" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();

                      // Toggle số trong danh sách
                      if (currentNumbers.includes(num)) {
                        methods.setValue(
                          "numbers",
                          currentNumbers.filter((n) => n !== num)
                        );
                      } else {
                        methods.setValue("numbers", [...currentNumbers, num]);
                      }
                    }}
                  >
                    {num}
                  </Badge>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        <p>
          Mỗi con giáp có các số tương ứng theo quy tắc cố định trong xổ số. Các
          số này dựa trên quy luật 12 con giáp, được tính theo số dư khi chia
          cho 12.
        </p>
      </div>
    </div>
  );
}
