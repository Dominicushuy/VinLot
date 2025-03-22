// src/lib/hooks/use-place-bet.ts
import { useMutation } from "@tanstack/react-query";
import { BetFormValues } from "@/lib/validators/bet-form-validator";

interface PlaceBetParams extends BetFormValues {
  userId: string; // ID người dùng (demo)
}

export function usePlaceBet() {
  return useMutation({
    mutationFn: async (data: PlaceBetParams) => {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi đặt cược");
      }

      return response.json();
    },
  });
}
