import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTables } from "@/lib/supabase/client";
import { Province } from "@/types";

// Hook để lấy danh sách tỉnh/thành phố
export function useProvinces() {
  return useQuery<Province[], Error>({
    queryKey: ["provinces"],
    queryFn: async () => {
      const { data, error } = await getTables().provinces().select("*");

      if (error) {
        throw new Error(`Error fetching provinces: ${error.message}`);
      }

      return data as Province[];
    },
  });
}

// Hook để lấy danh sách tỉnh/thành phố theo ngày trong tuần
export function useProvincesByDayOfWeek(dayOfWeekSlug: string) {
  const { data: provinces, ...rest } = useProvinces();

  // Filter provinces by draw day
  const filteredProvinces = provinces?.filter((p) =>
    p.draw_days.includes(dayOfWeekSlug)
  );

  return {
    ...rest,
    data: filteredProvinces,
  };
}

// Hook để lấy tất cả đài xổ số với filter theo miền
export function useProvincesByRegion(region?: string) {
  return useQuery<Province[], Error>({
    queryKey: ["provinces", { region }],
    queryFn: async () => {
      let query = getTables().provinces().select("*");

      // Nếu có filter theo miền, thêm vào query
      if (region) {
        query = query.eq("region", region);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching provinces: ${error.message}`);
      }

      return data as Province[];
    },
  });
}

// Hook để lấy chi tiết một đài xổ số theo ID
export function useProvinceDetails(id: string) {
  return useQuery<Province, Error>({
    queryKey: ["province", id],
    queryFn: async () => {
      const { data, error } = await getTables()
        .provinces()
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching province: ${error.message}`);
      }

      return data as Province;
    },
    enabled: !!id,
  });
}

// Hook để cập nhật đài xổ số
export function useUpdateProvince() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Province) => {
      const { data: response, error } = await getTables()
        .provinces()
        .update(data)
        .eq("id", data.id);

      if (error) {
        throw new Error(`Error updating province: ${error.message}`);
      }

      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["province", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
    },
  });
}

// Hook để tạo mới đài xổ số
export function useCreateProvince() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Province, "id">) => {
      const { data: response, error } = await getTables()
        .provinces()
        .insert(data);

      if (error) {
        throw new Error(`Error creating province: ${error.message}`);
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
    },
  });
}

// Hook để bật/tắt đài xổ số
export function useToggleProvinceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await getTables()
        .provinces()
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) {
        throw new Error(`Error toggling province status: ${error.message}`);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["province", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["provinces"] });
    },
  });
}
