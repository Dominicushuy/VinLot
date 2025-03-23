// src/lib/hooks/use-process-bets.ts
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ProcessAllResult {
  processed: number;
  won: number;
  total: number;
  updated: number;
}

interface ProcessSingleResult {
  id: string;
  status: "won" | "lost" | "pending";
  win_amount?: number;
  newly_processed?: boolean;
}

export function useProcessBets() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessAllResult | null>(null);

  // Xử lý đối soát tất cả các cược đang chờ
  const processAllBets = async (): Promise<ProcessAllResult | null> => {
    try {
      setIsProcessing(true);

      // Hiển thị toast đang xử lý
      toast({
        title: "Đang đối soát",
        description: "Đang xử lý tất cả các cược chưa đối soát...",
      });

      // Gọi API để đối soát tất cả
      const response = await fetch("/api/admin/process-all-pending", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi đối soát cược");
      }

      const data = await response.json();

      // Hiển thị kết quả
      if (data.processed > 0) {
        toast({
          title: "Đối soát thành công",
          description: `Đã xử lý ${data.processed} cược, ${data.won} cược thắng`,
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
        } else if (data.status === "lost") {
          toast({
            title: "Cược thua",
            description: "Phiếu cược không trúng thưởng",
          });
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
    processAllBets,
    processSingleBet,
  };
}
