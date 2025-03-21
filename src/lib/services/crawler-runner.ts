// src/lib/services/crawler-runner.ts
import axios from "axios";
import { JSDOM } from "jsdom";
import { supabase } from "@/lib/supabase/client";
import { saveResultsToDatabase } from "@/lib/utils/result-saver";

// Định nghĩa kiểu dữ liệu cho kết quả xổ số
export interface LotteryResult {
  metadata: {
    version: string;
    nguon: string;
    ngayLayDuLieu: string;
    tongSoMien: number;
    tongSoNgay: number;
    thuDaLay: string;
    ngayDaLay: string;
    quyTacApDung: string;
  };
  duLieu: {
    [key: string]: {
      [key: string]: any;
    };
  };
}

// Interface để định nghĩa tham số đầu vào cho crawler
export interface CrawlerParams {
  date: string;
  region: string;
  retryCount?: number;
  delayBetweenRequests?: number;
}

/**
 * Tạo thời gian chờ giữa các request
 * @param ms - Thời gian chờ tính bằng milliseconds
 * @returns Promise sẽ được resolve sau khoảng thời gian chờ
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Lấy HTML từ URL với cơ chế thử lại
 * @param url - URL cần lấy dữ liệu
 * @param retries - Số lần thử lại tối đa
 * @param maxRetries - Tổng số lần thử tối đa
 * @param delayMs - Độ trễ giữa các lần thử
 * @returns HTML content
 */
async function fetchWithRetry(
  url: string,
  retries: number,
  maxRetries: number,
  delayMs: number
): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`Thử lại (${maxRetries - retries + 1}/${maxRetries}): ${url}`);
    await delay(delayMs);
    return fetchWithRetry(url, retries - 1, maxRetries, delayMs);
  }
}

/**
 * Tạo chuỗi ngày chuẩn từ dữ liệu thô
 * @param rawDate - Chuỗi ngày thô (VD: "17/03/2025")
 * @returns Chuỗi ngày định dạng chuẩn (VD: "2025-03-17")
 */
function formatDate(rawDate: string): string {
  if (!rawDate) return "";
  const parts = rawDate.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return rawDate;
}

/**
 * Trích xuất dữ liệu xổ số miền Bắc
 * @param boxKqxs - Element chứa kết quả xổ số miền Bắc
 * @returns Dữ liệu xổ số đã được cấu trúc
 */
function extractMienBacData(boxKqxs: Element): any {
  // Lấy thông tin tỉnh thành từ tiêu đề
  const titleElement = boxKqxs.querySelector(".title");
  let tenTinh = "";

  if (titleElement) {
    const tinhLink = titleElement.querySelector("a:first-child");
    if (tinhLink) {
      const tinhText = tinhLink.textContent;
      tenTinh = tinhText ? tinhText.replace("KẾT QUẢ XỔ SỐ", "").trim() : "";
    }
  }

  // Lấy thông tin ngày
  const ngayElement = boxKqxs.querySelector(".ngay a");
  const rawDate = ngayElement ? ngayElement.textContent?.trim() || "" : "";
  const ngay = formatDate(rawDate);

  // Lấy thông tin thứ
  const thuElement = boxKqxs.querySelector(".thu a");
  const thu = thuElement ? thuElement.textContent?.trim() || "" : "";

  // Lấy mã vé số
  const loaiVeElement = boxKqxs.querySelector(".loaive_content");
  const loaiVe = loaiVeElement ? loaiVeElement.textContent?.trim() || "" : "";

  // Tìm bảng kết quả xổ số
  const kqTable = boxKqxs.querySelector("table.box_kqxs_content");
  if (!kqTable) {
    console.log("Không tìm thấy bảng kết quả xổ số");
    return null;
  }

  // Trích xuất kết quả các giải
  const ketQua = {
    giaiDacBiet: Array.from(kqTable.querySelectorAll("td.giaidb div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiNhat: Array.from(kqTable.querySelectorAll("td.giai1 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiNhi: Array.from(kqTable.querySelectorAll("td.giai2 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiBa: Array.from(kqTable.querySelectorAll("td.giai3 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiTu: Array.from(kqTable.querySelectorAll("td.giai4 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiNam: Array.from(kqTable.querySelectorAll("td.giai5 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiSau: Array.from(kqTable.querySelectorAll("td.giai6 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
    giaiBay: Array.from(kqTable.querySelectorAll("td.giai7 div")).map(
      (div) => div.textContent?.trim() || ""
    ),
  };

  return {
    tinh: tenTinh,
    ngay,
    thu,
    loaiVe,
    ketQua,
  };
}

/**
 * Trích xuất dữ liệu xổ số miền Nam, Trung
 * @param table - Element chứa kết quả xổ số
 * @returns Dữ liệu xổ số đã được cấu trúc
 */
function extractMienNamTrungData(table: Element): any {
  // Lấy thông tin ngày và thứ
  const thuElement = table.querySelector(".thu a");
  const thu = thuElement ? thuElement.textContent?.trim() || "" : "";

  const ngayElement = table.querySelector(".ngay a");
  const rawDate = ngayElement ? ngayElement.textContent?.trim() || "" : "";
  const ngay = formatDate(rawDate);

  // Xử lý cho miền Nam và miền Trung
  const provinceTableNodes = table.querySelectorAll("table.rightcl");
  const danhSachTinh: any[] = [];

  provinceTableNodes.forEach((provinceTable) => {
    const tenTinh =
      provinceTable.querySelector(".tinh a")?.textContent?.trim() || "";
    const maTinh =
      provinceTable.querySelector(".matinh")?.textContent?.trim() || "";

    // Lấy thông tin các giải thưởng
    const ketQua = {
      giaiDacBiet: Array.from(
        provinceTable.querySelectorAll(".giaidb div")
      ).map((div) => div.textContent?.trim() || ""),
      giaiNhat: Array.from(provinceTable.querySelectorAll(".giai1 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiNhi: Array.from(provinceTable.querySelectorAll(".giai2 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiBa: Array.from(provinceTable.querySelectorAll(".giai3 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiTu: Array.from(provinceTable.querySelectorAll(".giai4 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiNam: Array.from(provinceTable.querySelectorAll(".giai5 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiSau: Array.from(provinceTable.querySelectorAll(".giai6 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiBay: Array.from(provinceTable.querySelectorAll(".giai7 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
      giaiTam: Array.from(provinceTable.querySelectorAll(".giai8 div")).map(
        (div) => div.textContent?.trim() || ""
      ),
    };

    danhSachTinh.push({
      tinh: tenTinh,
      maTinh,
      ketQua,
    });
  });

  return {
    ngay,
    thu,
    cacTinh: danhSachTinh,
  };
}

/**
 * Lấy dữ liệu xổ số cho một ngày và miền cụ thể
 * @param mien - Tên miền (mien-bac, mien-trung, mien-nam)
 * @param dayOfWeek - Tên ngày (thu-hai, thu-ba, ...)
 * @param config - Cấu hình crawler
 * @returns Dữ liệu xổ số
 */
async function layDuLieuNgay(
  mien: string,
  dayOfWeek: string,
  config: { baseUrl: string; maxRetries: number; delayBetweenRequests: number }
): Promise<any> {
  try {
    console.log(`Đang lấy dữ liệu ${mien} - ${dayOfWeek}...`);
    const url = `${config.baseUrl}/${mien}/${dayOfWeek}.html`;

    // Lấy HTML từ trang web
    const html = await fetchWithRetry(
      url,
      config.maxRetries,
      config.maxRetries,
      config.delayBetweenRequests
    );

    // Phân tích HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    let duLieu;
    if (mien === "mien-bac") {
      const boxKqxs = document.querySelector(".box_kqxs");
      if (!boxKqxs) {
        console.log(`Không tìm thấy kết quả xổ số cho ${mien} - ${dayOfWeek}`);
        return null;
      }
      duLieu = extractMienBacData(boxKqxs);
    } else {
      const targetTable = document.querySelector("table.bkqmiennam");
      if (!targetTable) {
        console.log(
          `Không tìm thấy bảng kết quả xổ số cho ${mien} - ${dayOfWeek}`
        );
        return null;
      }
      duLieu = extractMienNamTrungData(targetTable);
    }

    return duLieu;
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu ${mien} - ${dayOfWeek}:`, error);
    return null;
  }
}

/**
 * Xác định ngày trong tuần từ date string
 * @param dateStr - Chuỗi ngày định dạng yyyy-mm-dd
 * @returns Thứ trong tuần (thu-hai, thu-ba, ...)
 */
function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const daysMapping = [
    "chu-nhat",
    "thu-hai",
    "thu-ba",
    "thu-tu",
    "thu-nam",
    "thu-sau",
    "thu-bay",
  ];
  return daysMapping[day];
}

/**
 * Hàm chính để chạy crawler
 * @param params - Tham số cho crawler
 * @returns Kết quả xổ số
 */
export async function runCrawler(
  params: CrawlerParams
): Promise<LotteryResult> {
  try {
    const {
      date,
      region,
      retryCount = 3,
      delayBetweenRequests = 1000,
    } = params;

    // Xác định thứ trong tuần từ ngày
    const dayOfWeek = getDayOfWeek(date);

    // Cấu hình cho crawler
    const config = {
      baseUrl: "https://www.minhngoc.net.vn/ket-qua-xo-so",
      maxRetries: retryCount,
      delayBetweenRequests: delayBetweenRequests,
    };

    // Lấy dữ liệu
    const duLieu = await layDuLieuNgay(region, dayOfWeek, config);

    // Tạo cấu trúc kết quả
    const ketQuaXoSo: LotteryResult = {
      metadata: {
        version: "1.1",
        nguon: config.baseUrl,
        ngayLayDuLieu: new Date().toISOString(),
        tongSoMien: 1,
        tongSoNgay: 1,
        thuDaLay: dayOfWeek,
        ngayDaLay: date,
        quyTacApDung: "Lấy dữ liệu theo thời gian cụ thể của từng miền",
      },
      duLieu: {},
    };

    // Thêm dữ liệu vào kết quả
    ketQuaXoSo.duLieu[dayOfWeek] = {};
    ketQuaXoSo.duLieu[dayOfWeek][region] = duLieu;

    return ketQuaXoSo;
  } catch (error) {
    console.error("Error running crawler:", error);
    throw new Error(
      `Crawler failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Hàm để chạy crawler tự động hàng ngày theo lịch
 * @returns Kết quả của quá trình chạy tự động
 */
export async function runScheduledCrawler(): Promise<any> {
  try {
    // Lấy cấu hình từ database
    const { data: configData, error: configError } = await supabase
      .from("crawler_config")
      .select("*")
      .single();

    if (configError) {
      throw new Error(`Failed to fetch crawler config: ${configError.message}`);
    }

    if (!configData.enabled) {
      console.log("Scheduled crawler is disabled");
      return { success: false, message: "Crawler is disabled" };
    }

    // Lấy ngày hiện tại
    const now = new Date();
    const formattedDate = now.toISOString().split("T")[0];

    // Xác định thứ trong tuần
    const dayOfWeek = getDayOfWeek(formattedDate);

    // Chạy crawler cho từng miền
    const results = [];
    const logEntries = [];

    const startTime = Date.now();

    for (const region of configData.regions) {
      try {
        // Chạy crawler và lấy kết quả
        const result = await runCrawler({
          date: formattedDate,
          region,
          retryCount: configData.retry_count,
          delayBetweenRequests: configData.delay_between_requests,
        });

        results.push({
          region,
          status: "success",
          data: result,
        });

        // Tạo log entry
        logEntries.push({
          date: formattedDate,
          time: new Date().toISOString().split("T")[1].substring(0, 8),
          type: "auto",
          region,
          status: "success",
          result_count: result?.duLieu ? Object.keys(result.duLieu).length : 0,
          result,
          duration: Date.now() - startTime,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        results.push({
          region,
          status: "error",
          error: errorMessage,
        });

        // Tạo log entry lỗi
        logEntries.push({
          date: formattedDate,
          time: new Date().toISOString().split("T")[1].substring(0, 8),
          type: "auto",
          region,
          status: "error",
          error: errorMessage,
          duration: Date.now() - startTime,
        });
      }

      // Chờ giữa các region để tránh quá tải
      await delay(configData.delay_between_requests);
    }

    // Lưu logs vào database
    if (logEntries.length > 0) {
      const { error: logError } = await supabase
        .from("crawler_logs")
        .insert(logEntries);

      if (logError) {
        console.error("Error saving crawler logs:", logError);
      }
    }

    // Lưu kết quả vào bảng results nếu thành công
    const successResults = results.filter((r) => r.status === "success");
    if (successResults.length > 0) {
      // Sử dụng utility function để lưu kết quả
      await saveResultsToDatabase(successResults);
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error running scheduled crawler:", error);

    // Lưu log lỗi vào database
    try {
      await supabase.from("crawler_logs").insert({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString().split("T")[1].substring(0, 8),
        type: "auto",
        region: "all",
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        duration: 0,
      });
    } catch (logError) {
      console.error("Error saving error log:", logError);
    }

    throw error;
  }
}
