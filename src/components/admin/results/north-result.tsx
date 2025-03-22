// src/components/admin/results/north-result.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";

interface NorthResultProps {
  result: any;
}

export function NorthResult({ result }: NorthResultProps) {
  if (!result) return null;

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-lottery-primary text-white p-4">
        <h3 className="text-xl font-semibold">{result.provinces.name}</h3>
        <p className="text-sm">
          {result.day_of_week} - {result.date}
        </p>
      </div>

      <CardContent className="p-4">
        <div className="lottery-table-container">
          <table className="lottery-table w-full border-collapse">
            <tbody>
              {/* Giải Đặc biệt */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center w-1/6">
                  Giải Đặc biệt
                </td>
                <td className="border p-2 text-center">
                  <div className="flex justify-center">
                    {result.special_prize?.map((num: string, i: number) => (
                      <span
                        key={i}
                        className="text-2xl text-lottery-primary font-bold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Nhất */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Nhất
                </td>
                <td className="border p-2 text-center">
                  <div className="flex justify-center">
                    {result.first_prize?.map((num: string, i: number) => (
                      <span
                        key={i}
                        className="text-xl text-lottery-primary font-semibold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Nhì */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Nhì
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {result.second_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Ba */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Ba
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {result.third_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Tư */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Tư
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-4 gap-2">
                    {result.fourth_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Năm */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Năm
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-6 gap-2">
                    {result.fifth_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Sáu */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Sáu
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {result.sixth_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Bảy */}
              <tr>
                <td className="bg-lottery-primary bg-opacity-10 font-semibold text-gray-700 border p-2 text-center">
                  Giải Bảy
                </td>
                <td className="border p-2">
                  <div className="grid grid-cols-4 gap-2">
                    {result.seventh_prize?.map((num: string, i: number) => (
                      <div key={i} className="text-center font-medium">
                        {num}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
