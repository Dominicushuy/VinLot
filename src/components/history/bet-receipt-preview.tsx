// src/components/history/bet-receipt-preview.tsx
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

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
  if (bet.status === "won") {
    statusText = "Đã thắng";
  } else if (bet.status === "lost") {
    statusText = "Đã thua";
  }

  return (
    <div className="print-container bg-white p-8 max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">PHIẾU CÁ CƯỢC XỔ SỐ</h1>
      </div>

      <div className="space-y-2 mb-6">
        <p>
          <span className="font-medium">Mã phiếu:</span> {bet.id}
        </p>
        <p>
          <span className="font-medium">Ngày cược:</span>{" "}
          {format(new Date(bet.bet_date), "dd/MM/yyyy", { locale: vi })}
        </p>
        <p>
          <span className="font-medium">Ngày xổ:</span>{" "}
          {format(new Date(bet.draw_date), "dd/MM/yyyy", { locale: vi })}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold border-b pb-2 mb-2">THÔNG TIN CƯỢC</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Miền:</span>{" "}
            {bet.region_type === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}
          </p>
          <p>
            <span className="font-medium">Đài xổ số:</span>{" "}
            {province?.name || bet.province_id}
          </p>
          <p>
            <span className="font-medium">Loại cược:</span> {betType}
            {betVariant ? ` (${betVariant})` : ""}
          </p>
          <p>
            <span className="font-medium">Mệnh giá:</span>{" "}
            {formatCurrency(bet.denomination)}
          </p>
          <p>
            <span className="font-medium">Tổng tiền cược:</span>{" "}
            {formatCurrency(bet.total_amount)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold border-b pb-2 mb-2">CÁC SỐ ĐÃ CHỌN</h2>
        <p>{bet.numbers.join(", ")}</p>
      </div>

      <div className="mb-6">
        <p>
          <span className="font-medium">Trạng thái:</span> {statusText}
        </p>

        {bet.status === "won" && bet.win_amount && (
          <div className="mt-2 space-y-1">
            <p>
              <span className="font-medium">Số tiền thắng:</span>{" "}
              {formatCurrency(bet.win_amount)}
            </p>
            <p>
              <span className="font-medium">Lợi nhuận:</span>{" "}
              {formatCurrency(bet.win_amount - bet.total_amount)}
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-10">
        <p>Phiếu này chỉ có giá trị tham khảo.</p>
        <p>In ngày: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
      </div>
    </div>
  );
}
