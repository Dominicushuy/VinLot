import { useQuery } from "@tanstack/react-query";
import { getTables } from "@/lib/supabase/client";

export interface ResultQueryParams {
  region?: "mien-bac" | "mien-trung" | "mien-nam";
  provinceId?: string;
  date?: string; // Thêm tham số date
}

export function useLotteryResults(params: ResultQueryParams = {}) {
  const { region, provinceId, date } = params;

  return useQuery({
    queryKey: ["lottery-results", { region, provinceId, date }],
    queryFn: async () => {
      // Bước 1: Lấy tất cả các tỉnh
      const { data: provinces, error: provincesError } = await getTables()
        .provinces()
        .select("*");

      if (provincesError) {
        throw new Error(`Error fetching provinces: ${provincesError.message}`);
      }

      // Bước 2: Tạo query lấy kết quả xổ số
      let resultsQuery = getTables()
        .results()
        .select(
          `
            id, 
            date, 
            day_of_week, 
            province_id,
            special_prize, 
            first_prize, 
            second_prize, 
            third_prize, 
            fourth_prize, 
            fifth_prize, 
            sixth_prize, 
            seventh_prize, 
            eighth_prize
          `
        )
        .order("date", { ascending: false })
        .limit(30); // Lấy 30 kết quả mới nhất

      // Lọc theo tỉnh nếu được chỉ định
      if (provinceId && provinceId !== "all") {
        resultsQuery = resultsQuery.eq("province_id", provinceId);
      }

      // Lọc theo ngày nếu có
      if (date) {
        resultsQuery = resultsQuery.eq("date", date);
      }

      const { data: resultsData, error: resultsError } = await resultsQuery;

      if (resultsError) {
        throw new Error(
          `Error fetching lottery results: ${resultsError.message}`
        );
      }

      // Bước 3: Kết hợp kết quả xổ số với thông tin tỉnh
      const resultsWithProvinces = resultsData
        .map((result: any) => {
          const province = provinces.find(
            (p: any) => p.province_id === result.province_id
          );

          if (!province) {
            return null;
          }

          // Nếu có filter region và tỉnh không thuộc region đó, bỏ qua
          if (region && province.region !== region) {
            return null;
          }

          return {
            ...result,
            provinces: province,
          };
        })
        .filter(Boolean); // Lọc các phần tử null

      // Bước 4: Nhóm kết quả theo ngày và miền
      const groupedResults = resultsWithProvinces.reduce(
        (acc: any, result: any) => {
          const resultDate = result.date;
          const resultRegion = result.provinces.region;

          if (!acc[resultDate]) {
            acc[resultDate] = {};
          }

          if (!acc[resultDate][resultRegion]) {
            acc[resultDate][resultRegion] = [];
          }

          acc[resultDate][resultRegion].push(result);

          return acc;
        },
        {}
      );

      return groupedResults;
    },
  });
}

// Phần này giữ nguyên
export function useProvincesByRegion() {
  return useQuery({
    queryKey: ["provinces-by-region"],
    queryFn: async () => {
      const { data, error } = await getTables()
        .provinces()
        .select("*")
        .order("name");

      if (error) {
        throw new Error(`Error fetching provinces: ${error.message}`);
      }

      const grouped = data.reduce((acc: any, province) => {
        if (!acc[province.region]) {
          acc[province.region] = [];
        }
        acc[province.region].push(province);
        return acc;
      }, {});

      return grouped;
    },
  });
}
