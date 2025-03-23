// src/components/history/bet-receipt-preview.tsx
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BetReceiptPreviewProps {
  bet: any;
  province: any;
  betType: string;
  betVariant?: string;
}

export function BetReceiptPreview({
  bet,
  province,
  betType,
  betVariant,
}: BetReceiptPreviewProps) {
  // Trạng thái cược
  let statusText = "Đang chờ";
  let statusClass = "bg-yellow-100 text-yellow-700";

  // Lấy thông tin chi tiết về số trúng từ cược nếu có
  const winningNumbers =
    bet.status === "won" && bet.winning_details
      ? bet.winning_details.winning_numbers
      : [];

  if (bet.status === "won") {
    statusText = "Đã thắng";
    statusClass = "bg-green-100 text-green-700";
  } else if (bet.status === "lost") {
    statusText = "Đã thua";
    statusClass = "bg-red-100 text-red-700";
  }

  // Tính lợi nhuận
  const profit =
    bet.status === "won"
      ? (bet.win_amount || 0) - bet.total_amount
      : -bet.total_amount;
  const profitClass = profit >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="print-container bg-white p-8 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">PHIẾU CÁ CƯỢC XỔ SỐ</h1>
        <p className="text-gray-500">ID: {bet.id}</p>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          <p className="font-medium">
            Ngày cược:{" "}
            {format(new Date(bet.bet_date), "dd/MM/yyyy", { locale: vi })}
          </p>
          <p className="font-medium">
            Ngày xổ:{" "}
            {format(new Date(bet.draw_date), "dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-md ${statusClass} font-medium`}>
          {statusText}
        </div>
      </div>

      <div className="mb-6 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b p-3">
          <h2 className="text-lg font-bold">THÔNG TIN CƯỢC</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Miền</p>
              <p className="font-medium">
                {bet.region_type === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đài xổ số</p>
              <p className="font-medium">{province?.name || bet.province_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Loại cược</p>
              <p className="font-medium">
                <span className="bg-lottery-primary/10 text-lottery-primary px-2 py-0.5 rounded text-xs mr-2">
                  {bet.bet_type}
                </span>
                {betType}
                {betVariant ? ` (${betVariant})` : ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số đánh</p>
              <p className="font-medium">{bet.numbers.length} số</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h3 className="font-medium mb-2">CÁC SỐ ĐÃ CHỌN</h3>
            <div className="flex flex-wrap gap-2">
              {bet.numbers.map((number: string, index: number) => (
                <span
                  key={index}
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm border
                    ${
                      winningNumbers.includes(number)
                        ? "bg-green-100 border-green-300 text-green-700 font-bold"
                        : "bg-gray-50 border-gray-200"
                    }`}
                >
                  {number}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b p-3">
          <h2 className="text-lg font-bold">THÔNG TIN TÀI CHÍNH</h2>
        </div>
        <div className="p-4">
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Mệnh giá:</td>
                <td className="py-2 text-right">
                  {formatCurrency(bet.denomination)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Tổng tiền cược:</td>
                <td className="py-2 text-right">
                  {formatCurrency(bet.total_amount)}
                </td>
              </tr>
              {bet.status !== "pending" && (
                <tr className="border-b">
                  <td className="py-2">Tiền thắng:</td>
                  <td className="py-2 text-right">
                    {bet.status === "won"
                      ? formatCurrency(bet.win_amount || 0)
                      : "0 ₫"}
                  </td>
                </tr>
              )}
              {bet.status !== "pending" && (
                <tr>
                  <td className="py-2 font-bold">Lời/Lỗ:</td>
                  <td className={`py-2 text-right font-bold ${profitClass}`}>
                    {formatCurrency(Math.abs(profit))}
                    {profit >= 0 ? " (lời)" : " (lỗ)"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bet.status === "won" && bet.win_amount && (
        <div className="mb-6 border-2 border-green-200 rounded-lg overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 p-3">
            <h2 className="text-lg font-bold text-green-700">
              CHI TIẾT THẮNG CƯỢC
            </h2>
          </div>
          <div className="p-4 bg-green-50/50">
            <div className="mb-3">
              <p className="text-sm text-green-700 font-medium">
                Số trúng: {winningNumbers.length} số
              </p>
            </div>
            {winningNumbers.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {winningNumbers.map((number: string, idx: number) => (
                    <Badge key={idx} variant="lottery" className="bg-green-600">
                      {number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-green-700 font-medium mb-2">
              Công thức tính tiền thắng:
            </p>
            <p className="px-3 py-2 bg-white rounded border border-green-200 text-green-700">
              Mệnh giá × Số lần trúng × Tỷ lệ = {formatCurrency(bet.win_amount)}
            </p>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-10 pt-4 border-t">
        <div className="flex justify-between">
          <p>Mã phiếu: {bet.id.substring(0, 8)}...</p>
          <p>
            In ngày: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}
          </p>
        </div>
        <p className="mt-2 text-center italic">
          Phiếu này chỉ có giá trị tham khảo.
        </p>
      </div>
    </div>
  );
}
