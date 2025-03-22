// src/lib/hooks/use-pdf.ts
import { useState } from "react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

export function usePDF() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBetReceipt = async (params: {
    bet: any;
    province: any;
    betType: string;
    betVariant?: string;
  }) => {
    try {
      setIsGenerating(true);
      const { bet, province, betType, betVariant } = params;

      // Tạo đối tượng PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      // Cấu hình
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const lineHeight = 7;
      let y = 20;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("PHIẾU CÁ CƯỢC XỔ SỐ", pageWidth / 2, y, { align: "center" });
      y += lineHeight * 2;

      // Thông tin phiếu
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Mã phiếu: ${bet.id}`, margin, y);
      y += lineHeight;
      doc.text(
        `Ngày cược: ${format(new Date(bet.bet_date), "dd/MM/yyyy", {
          locale: vi,
        })}`,
        margin,
        y
      );
      y += lineHeight;
      doc.text(
        `Ngày xổ: ${format(new Date(bet.draw_date), "dd/MM/yyyy", {
          locale: vi,
        })}`,
        margin,
        y
      );
      y += lineHeight * 1.5;

      // Thông tin cược
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("THÔNG TIN CƯỢC", margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(
        `Miền: ${bet.region_type === "M1" ? "Miền Nam/Trung" : "Miền Bắc"}`,
        margin,
        y
      );
      y += lineHeight;
      doc.text(`Đài xổ số: ${province?.name || bet.province_id}`, margin, y);
      y += lineHeight;
      doc.text(
        `Loại cược: ${betType}${betVariant ? ` (${betVariant})` : ""}`,
        margin,
        y
      );
      y += lineHeight;
      doc.text(`Mệnh giá: ${formatCurrency(bet.denomination)}`, margin, y);
      y += lineHeight;
      doc.text(
        `Tổng tiền cược: ${formatCurrency(bet.total_amount)}`,
        margin,
        y
      );
      y += lineHeight * 1.5;

      // Danh sách số
      doc.setFont("helvetica", "bold");
      doc.text("CÁC SỐ ĐÃ CHỌN", margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      // Chia số thành các hàng, mỗi hàng tối đa 10 số
      const numbersPerRow = 10;
      const rows = Math.ceil(bet.numbers.length / numbersPerRow);

      for (let i = 0; i < rows; i++) {
        const rowNumbers = bet.numbers.slice(
          i * numbersPerRow,
          (i + 1) * numbersPerRow
        );
        const numbersText = rowNumbers.join(", ");
        doc.text(numbersText, margin, y);
        y += lineHeight;
      }

      y += lineHeight;

      // Trạng thái cược
      let statusText = "Đang chờ";
      if (bet.status === "won") {
        statusText = "Đã thắng";
      } else if (bet.status === "lost") {
        statusText = "Đã thua";
      }

      doc.setFont("helvetica", "bold");
      doc.text(`Trạng thái: ${statusText}`, margin, y);
      y += lineHeight;

      // Thông tin thắng cược nếu có
      if (bet.status === "won" && bet.win_amount) {
        doc.text(`Số tiền thắng: ${formatCurrency(bet.win_amount)}`, margin, y);
        y += lineHeight;
        doc.text(
          `Lợi nhuận: ${formatCurrency(bet.win_amount - bet.total_amount)}`,
          margin,
          y
        );
        y += lineHeight;
      }

      y += lineHeight * 2;

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text("Phiếu này chỉ có giá trị tham khảo.", margin, y);
      y += lineHeight;
      doc.text(
        `In ngày: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi })}`,
        margin,
        y
      );

      // Lưu và mở file
      doc.save(`phieu-ca-cuoc-${bet.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateBetReceipt,
  };
}
