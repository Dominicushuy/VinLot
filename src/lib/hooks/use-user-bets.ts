// src/lib/hooks/use-user-bets.ts
import { useQuery } from "@tanstack/react-query";
import { getTables } from "@/lib/supabase/client";

export interface UserBetsParams {
  userId: string;
  status?: "pending" | "won" | "lost";
  startDate?: string;
  endDate?: string;
  betType?: string;
  provinceId?: string;
}

// Define interface for Province data
interface Province {
  province_id: string;
  name: string;
}

export function useUserBets(params: UserBetsParams) {
  const { userId, status, startDate, endDate, betType, provinceId } = params;

  return useQuery({
    queryKey: ["user-bets", params],
    queryFn: async () => {
      // Primeiro, busque as apostas
      let query = getTables()
        .bets()
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Aplique os filtros
      if (status) {
        query = query.eq("status", status);
      }
      if (startDate) {
        query = query.gte("draw_date", startDate);
      }
      if (endDate) {
        query = query.lte("draw_date", endDate);
      }
      if (betType) {
        query = query.eq("bet_type", betType);
      }
      if (provinceId) {
        query = query.eq("province_id", provinceId);
      }

      const { data: bets, error } = await query;

      if (error) {
        throw new Error(`Lỗi khi lấy lịch sử cược: ${error.message}`);
      }

      // Se tiver apostas, busque as províncias relacionadas
      if (bets && bets.length > 0) {
        // Extraia todos os IDs de província únicos
        const provinceIds = [...new Set(bets.map((bet) => bet.province_id))];

        // Busque as informações das províncias
        const { data: provinces } = await getTables()
          .provinces()
          .select("province_id,name")
          .in("province_id", provinceIds);

        // Crie um mapa de provinceId -> nome para lookup rápido
        const provinceMap: Record<string, string> = {};
        if (provinces) {
          provinces.forEach((province: Province) => {
            provinceMap[province.province_id] = province.name;
          });
        }

        // Adicione a informação da província a cada aposta
        return bets.map((bet) => ({
          ...bet,
          province: {
            name: provinceMap[bet.province_id] || bet.province_id,
          },
        }));
      }

      return bets || [];
    },
    enabled: !!userId,
  });
}
