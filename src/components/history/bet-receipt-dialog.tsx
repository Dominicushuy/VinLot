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
  if (!betData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Xem trước phiếu cược</DialogTitle>
        </DialogHeader>

        <BetReceiptPreview
          bet={betData.bet}
          province={betData.province}
          betType={betData.betType}
          betVariant={betData.betVariant}
        />

        <DialogFooter className="no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onPrint}>In phiếu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
