import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables } from "@/lib/supabase/client";

// Hook để lấy tất cả loại cược
export function useBetTypes(regionFilter?: string) {
  return useQuery<any[], Error>({
    queryKey: ["betTypes", { regionFilter }],
    queryFn: async () => {
      let query = getTables().rules().select("*");

      // Nếu có filter theo miền, thêm vào query
      // Lưu ý: Đây là ví dụ, thực tế phụ thuộc vào cấu trúc database
      if (regionFilter) {
        query = query.filter("region_rules", "ilike", `%${regionFilter}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching bet types: ${error.message}`);
      }

      // Parse JSONB fields
      return data.map((item) => ({
        ...item,
        region_rules:
          typeof item.region_rules === "string"
            ? JSON.parse(item.region_rules)
            : item.region_rules,
        variants:
          typeof item.variants === "string"
            ? JSON.parse(item.variants)
            : item.variants,
        winning_ratio:
          typeof item.winning_ratio === "string"
            ? JSON.parse(item.winning_ratio)
            : item.winning_ratio,
      }));
    },
  });
}

// Hook để lấy chi tiết một loại cược theo ID
export function useBetTypeDetails(id: string) {
  return useQuery<any, Error>({
    queryKey: ["betType", id],
    queryFn: async () => {
      const { data, error } = await getTables()
        .rules()
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching bet type: ${error.message}`);
      }

      // Parse JSONB fields
      return {
        ...data,
        region_rules:
          typeof data.region_rules === "string"
            ? JSON.parse(data.region_rules)
            : data.region_rules,
        variants:
          typeof data.variants === "string"
            ? JSON.parse(data.variants)
            : data.variants,
        winning_ratio:
          typeof data.winning_ratio === "string"
            ? JSON.parse(data.winning_ratio)
            : data.winning_ratio,
      };
    },
    enabled: !!id,
  });
}

// Hook để cập nhật loại cược
export function useUpdateBetType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Convert objects to JSONB strings if needed
      const payload = {
        ...data,
        region_rules:
          typeof data.region_rules === "object"
            ? data.region_rules
            : JSON.parse(data.region_rules),
        variants:
          typeof data.variants === "object"
            ? data.variants
            : JSON.parse(data.variants),
        winning_ratio:
          typeof data.winning_ratio === "object"
            ? data.winning_ratio
            : JSON.parse(data.winning_ratio),
      };

      const { data: response, error } = await getTables()
        .rules()
        .update(payload)
        .eq("id", data.id);

      if (error) {
        throw new Error(`Error updating bet type: ${error.message}`);
      }

      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["betType", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["betTypes"] });
    },
  });
}

// Hook để tạo mới loại cược
export function useCreateBetType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Remove id field if it's empty
      if (!data.id) {
        delete data.id;
      }

      // Convert objects to JSONB strings if needed
      const payload = {
        ...data,
        region_rules:
          typeof data.region_rules === "object"
            ? data.region_rules
            : JSON.parse(data.region_rules),
        variants:
          typeof data.variants === "object"
            ? data.variants
            : JSON.parse(data.variants),
        winning_ratio:
          typeof data.winning_ratio === "object"
            ? data.winning_ratio
            : JSON.parse(data.winning_ratio),
      };

      const { data: response, error } = await getTables()
        .rules()
        .insert(payload);

      if (error) {
        throw new Error(`Error creating bet type: ${error.message}`);
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["betTypes"] });
    },
  });
}

// Hook để bật/tắt loại cược
export function useToggleBetTypeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await getTables()
        .rules()
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) {
        throw new Error(`Error toggling bet type status: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["betType", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["betTypes"] });
    },
  });
}
