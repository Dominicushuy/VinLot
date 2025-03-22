// src/lib/hooks/use-pdf.ts
import { useState } from "react";

export function usePDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentBet, setCurrentBet] = useState<any>(null);

  const generateBetReceipt = (params: {
    bet: any;
    province: any;
    betType: string;
    betVariant?: string;
  }) => {
    try {
      setIsGenerating(true);
      setCurrentBet(params);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating receipt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    isGenerating,
    generateBetReceipt,
    previewOpen,
    setPreviewOpen,
    currentBet,
    handlePrint,
  };
}
