// src/components/history/bet-detail-analysis.tsx - Cập nhật component hiển thị phân tích

import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WinningDetail } from "@/types";

interface BetDetailAnalysisProps {
  bet: any;
  betType: any;
  results: any;
}

export function BetDetailAnalysis({
  bet,
  betType,
  results,
}: BetDetailAnalysisProps) {
  // Nếu không có kết quả hoặc không phải bet thắng
  if (!results || bet.status !== "won" || !bet.winning_details) return null;

  // Lấy thông tin chi tiết từ bet
  const { winning_numbers, details } = bet.winning_details;

  // Tính tỷ lệ thưởng
  let winRatio = "N/A";
  if (betType?.winning_ratio) {
    const winningRatio =
      typeof betType.winning_ratio === "string"
        ? JSON.parse(betType.winning_ratio)
        : betType.winning_ratio;

    if (typeof winningRatio === "number") {
      winRatio = winningRatio.toString();
    } else if (bet.bet_variant && winningRatio[bet.bet_variant]) {
      if (typeof winningRatio[bet.bet_variant] === "number") {
        winRatio = winningRatio[bet.bet_variant].toString();
      }
    }
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-green-50 border-b border-green-100 p-3">
        <h3 className="font-medium text-green-800">Phân tích trúng thưởng</h3>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Tổng các số đánh: {bet.numbers.length} số
          </p>
          <div className="flex flex-wrap gap-2">
            {bet.numbers.map((number: string, index: number) => (
              <Badge
                key={index}
                variant={
                  winning_numbers.includes(number) ? "lottery" : "outline"
                }
                className={`px-3 py-1 ${
                  winning_numbers.includes(number)
                    ? "ring-2 ring-offset-2 ring-green-100"
                    : ""
                }`}
              >
                {number}
              </Badge>
            ))}
          </div>
        </div>

        {details && details.length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-2 px-3 text-left">Số trúng</th>
                  <th className="py-2 px-3 text-left">Giải</th>
                  <th className="py-2 px-3 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {details.map((detail: WinningDetail, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-3">
                      <Badge variant="lottery" className="bg-green-600">
                        {detail.number}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      <div>
                        <div className="font-medium">{detail.prize_name}</div>
                        <div className="text-xs text-gray-500">
                          {detail.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatCurrency(detail.win_amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-green-50 font-medium">
                  <td className="py-2 px-3" colSpan={2}>
                    Tổng tiền thưởng
                  </td>
                  <td className="py-2 px-3 text-right text-green-700">
                    {formatCurrency(bet.win_amount || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 bg-green-50 p-3 rounded-md">
          <p className="text-sm font-medium text-green-700 mb-2">
            Công thức tính tiền thắng:
          </p>
          <p className="text-sm text-green-600">
            {winning_numbers.length} số trúng ×{" "}
            {formatCurrency(bet.denomination)} ×{` tỷ lệ ${winRatio}`} ={" "}
            {formatCurrency(bet.win_amount || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
