// src/lib/hooks/use-process-bets.ts
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ProcessResult {
  success: boolean;
  processed: number;
  won: number;
  total: number;
  updated?: number;
}

export function useProcessBets() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);

  // Xử lý đối soát tất cả cược
  const processAllBets = async (): Promise<ProcessResult | null> => {
    try {
      setIsProcessing(true);
      setResult(null);

      const response = await fetch("/api/admin/process-all-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Đối soát thất bại");
      }

      const data = await response.json();

      // Lưu kết quả
      setResult(data);

      // Hiển thị thông báo
      toast({
        title: "Đối soát thành công",
        description: `Đã xử lý ${data.processed} cược, ${data.won} cược thắng.`,
      });

      return data;
    } catch (error: any) {
      console.error("Error processing all bets:", error);

      toast({
        title: "Lỗi khi đối soát",
        description:
          error.message || "Đối soát thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đối soát theo ngày
  const processBetsByDate = async (
    date: string
  ): Promise<ProcessResult | null> => {
    try {
      setIsProcessing(true);
      setResult(null);

      const response = await fetch("/api/admin/process-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Đối soát thất bại");
      }

      const data = await response.json();

      // Lưu kết quả
      setResult(data);

      // Hiển thị thông báo
      toast({
        title: "Đối soát thành công",
        description: `Đã xử lý ${data.processed} cược, ${data.won} cược thắng.`,
      });

      return data;
    } catch (error: any) {
      console.error(`Error processing bets for date ${date}:`, error);

      toast({
        title: "Lỗi khi đối soát",
        description:
          error.message || "Đối soát thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đối soát một cược cụ thể
  const processSingleBet = async (betId: string): Promise<any> => {
    try {
      setIsProcessing(true);

      const response = await fetch(`/api/bets/check/${betId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Kiểm tra cược thất bại");
      }

      const data = await response.json();

      if (data.status === "pending") {
        toast({
          title: "Chưa có kết quả",
          description: "Chưa có kết quả xổ số cho phiếu cược này",
        });
      } else {
        toast({
          title: "Đối soát thành công",
          description:
            data.status === "won"
              ? `Phiếu trúng thưởng! Tiền thắng: ${data.win_amount.toLocaleString()} VND`
              : "Phiếu không trúng thưởng",
          variant: data.status === "won" ? "default" : "destructive",
        });
      }

      return data;
    } catch (error: any) {
      console.error(`Error processing bet ${betId}:`, error);

      toast({
        title: "Lỗi",
        description: error.message || "Kiểm tra cược thất bại",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    result,
    processAllBets,
    processBetsByDate,
    processSingleBet,
  };
}
