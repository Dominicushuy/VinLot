// Các loại dữ liệu cho crawler
export interface CrawlerConfig {
  enabled: boolean;
  schedule: {
    hour: number;
    minute: number;
  };
  regions: string[];
  retryCount: number;
  delayBetweenRequests: number;
}

export interface CrawlerLog {
  id: string;
  date: string;
  time: string;
  type: "auto" | "manual";
  region: string;
  status: "success" | "error";
  resultCount?: number;
  error?: string;
  duration: number;
  result?: any;
}

// Service để tương tác với API crawler
export const crawlerService = {
  // Lấy cấu hình crawler
  async getConfig(): Promise<CrawlerConfig> {
    try {
      const response = await fetch("/api/crawler/config");

      if (!response.ok) {
        throw new Error("Failed to fetch crawler config");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching crawler config:", error);
      // Trả về cấu hình mặc định nếu có lỗi
      return {
        enabled: true,
        schedule: {
          hour: 18,
          minute: 30,
        },
        regions: ["mien-bac", "mien-trung", "mien-nam"],
        retryCount: 3,
        delayBetweenRequests: 1000,
      };
    }
  },

  // Lưu cấu hình crawler
  async saveConfig(config: CrawlerConfig): Promise<CrawlerConfig> {
    const response = await fetch("/api/crawler/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error("Failed to save crawler config");
    }

    return response.json();
  },

  // Chạy crawler thủ công
  async runCrawler(params: { date: string; regions: string[] }): Promise<any> {
    const response = await fetch("/api/crawler/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Failed to run crawler");
    }

    return response.json();
  },

  // Lấy danh sách logs crawler
  async getLogs(filters?: {
    status?: "success" | "error";
    region?: string;
    searchTerm?: string;
  }): Promise<CrawlerLog[]> {
    let url = "/api/crawler/logs";

    // Thêm query params từ filters
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.region) params.append("region", filters.region);
      if (filters.searchTerm) params.append("search", filters.searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch crawler logs");
    }

    return response.json();
  },

  // Lấy chi tiết một log
  async getLogDetail(id: string): Promise<CrawlerLog> {
    const response = await fetch(`/api/crawler/logs/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch log detail");
    }

    return response.json();
  },
};
