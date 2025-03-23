// src/components/history/bet-receipt-dialog.tsx
"use client";

import { BetReceiptPreview } from "@/components/history/bet-receipt-preview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BetReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  betData: any;
  onPrint: () => void;
}

export function BetReceiptDialog({
  open,
  onOpenChange,
  betData,
  onPrint,
}: BetReceiptDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!betData) return null;

  const handlePrint = async () => {
    setIsLoading(true);
    try {
      await onPrint();
    } catch (error) {
      console.error("Error printing receipt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Xem trước phiếu cược</span>
            <span className="text-sm font-normal text-gray-500">
              ID: {betData.bet.id.substring(0, 8)}...
            </span>
          </DialogTitle>
        </DialogHeader>

        <BetReceiptPreview
          bet={betData.bet}
          province={betData.province}
          betType={betData.betType}
          betVariant={betData.betVariant}
        />

        <DialogFooter className="no-print gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? "Đang in..." : "In phiếu"}
            {betData.bet.status === "won" && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
