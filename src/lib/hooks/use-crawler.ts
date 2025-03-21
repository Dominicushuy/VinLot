import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crawlerService } from "@/lib/services/crawler-service";

// Hook để lấy cấu hình crawler
export function useCrawlerConfig() {
  return useQuery({
    queryKey: ["crawler", "config"],
    queryFn: async () => {
      return crawlerService.getConfig();
    },
  });
}

// Hook để lưu cấu hình crawler
export function useSaveCrawlerConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      return crawlerService.saveConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler", "config"] });
    },
  });
}

// Hook để chạy crawler thủ công
export function useRunCrawler() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { date: string; regions: string[] }) => {
      return crawlerService.runCrawler(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler", "logs"] });
    },
  });
}

// Hook để lấy logs của crawler
export function useCrawlerLogs(filters?: {
  status?: "success" | "error";
  region?: string;
  searchTerm?: string;
}) {
  return useQuery({
    queryKey: ["crawler", "logs", filters],
    queryFn: async () => {
      return crawlerService.getLogs(filters);
    },
  });
}

// Hook để lấy log chi tiết
export function useCrawlerLogDetail(id: string) {
  return useQuery({
    queryKey: ["crawler", "log", id],
    queryFn: async () => {
      return crawlerService.getLogDetail(id);
    },
    enabled: !!id,
  });
}
