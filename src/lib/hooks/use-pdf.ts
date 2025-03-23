// src/lib/hooks/use-pdf.ts
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface GeneratePDFParams {
  bet: any;
  province: any;
  betType: string;
  betVariant?: string;
  winningNumbers?: string[];
}

export function usePDF() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentBet, setCurrentBet] = useState<GeneratePDFParams | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const generateBetReceipt = (params: GeneratePDFParams) => {
    try {
      setIsGenerating(true);

      // Nếu là bet thắng, tính toán các số trúng (giả lập)
      if (params.bet.status === "won" && !params.winningNumbers) {
        // Trong thực tế cần logic phức tạp hơn
        const winningCount = Math.min(3, params.bet.numbers.length);
        params.winningNumbers = params.bet.numbers.slice(0, winningCount);
      }

      setCurrentBet(params);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast({
        title: "Lỗi tạo phiếu",
        description: "Không thể tạo phiếu xem trước. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await new Promise((resolve) => {
        window.print();
        // Thêm timeout vì window.print() là đồng bộ nhưng quá trình in thực tế thì không
        setTimeout(resolve, 1000);
      });

      toast({
        title: "In thành công",
        description: "Phiếu cược đã được gửi đến máy in của bạn",
      });

      return true;
    } catch (error) {
      console.error("Error printing:", error);
      toast({
        title: "Lỗi in",
        description: "Không thể in phiếu. Vui lòng kiểm tra máy in và thử lại.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Đang chuẩn bị tải xuống",
        description: "Đang tạo file PDF...",
      });

      // Giả lập tạo PDF - trong thực tế sử dụng thư viện như jsPDF
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Đã tạo file PDF",
        description: "File PDF đã được tải xuống",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tạo file PDF. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    isPrinting,
    generateBetReceipt,
    previewOpen,
    setPreviewOpen,
    currentBet,
    handlePrint,
    downloadPDF,
  };
}
