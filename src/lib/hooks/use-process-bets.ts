// src/lib/hooks/use-process-bets.ts
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ProcessAllResult {
  processed: number;
  won: number;
  total: number;
  updated: number;
  totalWinAmount?: number;
}

interface ProcessSingleResult {
  id: string;
  status: "won" | "lost" | "pending";
  win_amount?: number;
  winning_details?: any;
  newly_processed?: boolean;
  already_processed?: boolean;
  error?: string;
}

interface ProcessingStats {
  total: number;
  completed: number;
  success: number;
  failed: number;
  pending: number;
  totalWinAmount: number;
}

export function useProcessBets() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessAllResult | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    total: 0,
    completed: 0,
    success: 0,
    failed: 0,
    pending: 0,
    totalWinAmount: 0,
  });
  const [processingDate, setProcessingDate] = useState<string>("");
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  // Reset stats khi bắt đầu quá trình mới
  useEffect(() => {
    if (isProcessing) {
      setProcessingStats({
        total: 0,
        completed: 0,
        success: 0,
        failed: 0,
        pending: 0,
        totalWinAmount: 0,
      });
    }
  }, [isProcessing]);

  // Xử lý đối soát tất cả các cược đang chờ
  const processAllBets = async (
    date?: string
  ): Promise<ProcessAllResult | null> => {
    try {
      setIsProcessing(true);

      const processDate = date || new Date().toISOString().split("T")[0];
      setProcessingDate(processDate);

      // Gọi API đối soát tất cả cược đang chờ
      const response = await fetch("/api/admin/process-all-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: processDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi đối soát cược");
      }

      const data = await response.json();
      setLastProcessed(new Date());

      // Cập nhật toastId với kết quả
      if (data.processed > 0) {
        toast({
          title: "Đối soát thành công",
          description: `Đã xử lý ${data.processed} cược, ${
            data.won
          } cược thắng với tổng số tiền ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
          }).format(data.totalWinAmount || 0)}`,
          variant: "lottery",
        });
      } else {
        toast({
          title: "Không có cược nào được xử lý",
          description:
            data.message ||
            "Không có cược để đối soát hoặc chưa có kết quả xổ số",
        });
      }

      // Cập nhật stats với kết quả
      setProcessingStats({
        total: data.total || 0,
        completed: data.processed || 0,
        success: data.won || 0,
        failed: (data.processed || 0) - (data.won || 0),
        pending: (data.total || 0) - (data.processed || 0),
        totalWinAmount: data.totalWinAmount || 0,
      });

      // Lưu kết quả để hiển thị
      setResult(data);

      return data;
    } catch (error: any) {
      console.error("Error processing all bets:", error);

      toast({
        title: "Lỗi đối soát",
        description: error.message || "Đã xảy ra lỗi khi đối soát cược",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đối soát một cược cụ thể
  const processSingleBet = async (
    betId: string
  ): Promise<ProcessSingleResult | null> => {
    try {
      setIsProcessing(true);

      // Gọi API để đối soát một cược
      const response = await fetch(`/api/bets/check/${betId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi đối soát cược");
      }

      const data = await response.json();

      // Hiển thị kết quả nếu mới được xử lý
      if (data.newly_processed) {
        if (data.status === "won") {
          toast({
            title: "Cược thắng",
            description: `Phiếu cược đã thắng ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(data.win_amount || 0)}`,
            variant: "lottery",
          });

          // Cập nhật stats
          setProcessingStats((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            success: prev.success + 1,
            totalWinAmount: prev.totalWinAmount + (data.win_amount || 0),
          }));
        } else if (data.status === "lost") {
          toast({
            title: "Cược thua",
            description: "Phiếu cược không trúng thưởng",
          });

          // Cập nhật stats
          setProcessingStats((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            failed: prev.failed + 1,
          }));
        }
      } else if (data.already_processed) {
        toast({
          title: "Đã đối soát trước đây",
          description: `Phiếu cược này đã được đối soát, kết quả: ${
            data.status === "won" ? "Thắng" : "Thua"
          }`,
        });
      } else if (data.status === "pending") {
        toast({
          title: "Chưa thể đối soát",
          description: "Chưa có kết quả xổ số cho phiếu cược này",
          variant: "destructive",
        });

        // Cập nhật stats
        setProcessingStats((prev) => ({
          ...prev,
          pending: prev.pending + 1,
        }));
      }

      return data;
    } catch (error: any) {
      console.error("Error processing single bet:", error);

      toast({
        title: "Lỗi đối soát",
        description: error.message || "Đã xảy ra lỗi khi đối soát cược",
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
    processingStats,
    processingDate,
    lastProcessed,
    processAllBets,
    processSingleBet,
  };
}
