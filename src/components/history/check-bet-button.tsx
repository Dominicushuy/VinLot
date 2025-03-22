"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CheckBetButtonProps {
  betId: string;
  onResultsChecked?: (results: any) => void;
}

export function CheckBetButton({
  betId,
  onResultsChecked,
}: CheckBetButtonProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckResults = async () => {
    try {
      setIsChecking(true);

      const response = await fetch(`/api/bets/check/${betId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể kiểm tra kết quả");
      }

      const data = await response.json();

      if (onResultsChecked) {
        onResultsChecked(data);
      }

      toast({
        title: "Kiểm tra thành công",
        description:
          data.status === "pending"
            ? "Phiếu đang chờ kết quả xổ số."
            : data.status === "won"
            ? "Chúc mừng! Phiếu của bạn đã trúng thưởng."
            : "Rất tiếc! Phiếu của bạn không trúng thưởng.",
        variant: data.status === "won" ? "lottery" : "default",
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
    <Button
      variant="lottery"
      size="sm"
      onClick={handleCheckResults}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang kiểm tra...
        </>
      ) : (
        "Kiểm tra kết quả"
      )}
    </Button>
  );
}
