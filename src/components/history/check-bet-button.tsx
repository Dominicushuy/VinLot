// src/components/history/check-bet-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

interface CheckBetButtonProps {
  betId: string;
  onResultsChecked?: (results: any) => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "lottery";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CheckBetButton({
  betId,
  onResultsChecked,
  variant = "lottery",
  size = "sm",
}: CheckBetButtonProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

  const handleCheckResults = async () => {
    try {
      setIsChecking(true);

      const response = await fetch(`/api/bets/check/${betId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể kiểm tra kết quả");
      }

      const data = await response.json();
      setLastCheckTime(new Date());

      if (onResultsChecked) {
        onResultsChecked(data);
      }

      let toastVariant: "default" | "destructive" | "lottery" = "default";
      let title = "Kiểm tra thành công";
      let description = "";

      if (data.status === "pending") {
        description = "Phiếu đang chờ kết quả xổ số.";
      } else if (data.status === "won") {
        toastVariant = "lottery";
        title = "Chúc mừng! Phiếu của bạn đã trúng thưởng";
        description = `Phiếu trúng thưởng ${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(data.win_amount || 0)}`;
      } else {
        description = "Rất tiếc! Phiếu của bạn không trúng thưởng.";
      }

      toast({
        title,
        description,
        variant: toastVariant,
      });
    } catch (error: any) {
      console.error("Error checking bet results:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể kiểm tra kết quả",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center">
      <Button
        variant={variant as any}
        size={size}
        onClick={handleCheckResults}
        disabled={isChecking}
        className="relative"
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang kiểm tra...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Kiểm tra kết quả
          </>
        )}
      </Button>
      {lastCheckTime && (
        <span className="text-xs text-gray-500 mt-1">
          Kiểm tra lúc: {lastCheckTime.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
