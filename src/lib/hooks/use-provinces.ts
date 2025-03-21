import { useQuery } from "@tanstack/react-query";
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

// Hook để lấy danh sách tỉnh/thành phố theo miền
export function useProvincesByRegion(region?: string) {
  const { data: provinces, ...rest } = useProvinces();

  // Filter provinces by region if provided
  const filteredProvinces = region
    ? provinces?.filter((p) => p.region === region)
    : provinces;

  return {
    ...rest,
    data: filteredProvinces,
  };
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
