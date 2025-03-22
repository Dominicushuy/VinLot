// src/lib/hooks/use-process-bet-results.ts
import { useMutation } from "@tanstack/react-query";

export function useProcessBetResults() {
  return useMutation({
    mutationFn: async (date: string) => {
      const response = await fetch("/api/bets/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi đối soát kết quả");
      }

      return response.json();
    },
  });
}
