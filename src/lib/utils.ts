import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LotteryData } from "@/types";

// Utility function cho class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date string thành dd/MM/yyyy
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Tính tổng tiền đóng dựa trên các thông số cược
 */
export function calculateBetAmount(
  betTypeId: string,
  betVariant: string | undefined,
  regionType: "M1" | "M2",
  denomination: number,
  numbersCount: number,
  lotteryData: LotteryData
): number {
  // Tìm loại cược từ dữ liệu
  const betType = lotteryData.betTypes.find((bt) => bt.id === betTypeId);
  if (!betType) {
    throw new Error(`Không tìm thấy loại cược với ID: ${betTypeId}`);
  }

  // Tìm khu vực (miền) từ loại cược
  const region = betType.regions.find((r) => r.id === regionType);
  if (!region) {
    throw new Error(`Loại cược ${betTypeId} không hỗ trợ miền ${regionType}`);
  }

  // Lấy hệ số nhân theo biến thể
  let multiplier: number;

  if (typeof region.betMultipliers === "number") {
    multiplier = region.betMultipliers;
  } else if (betVariant && region.betMultipliers[betVariant]) {
    multiplier = region.betMultipliers[betVariant];
  } else {
    throw new Error(`Không thể xác định hệ số nhân cho biến thể ${betVariant}`);
  }

  // Tính tổng tiền
  return denomination * multiplier * numbersCount;
}

/**
 * Tính số tiền tiềm năng thắng cho một số cược
 */
// src/lib/utils.ts - cập nhật hàm calculatePotentialWinAmount
export function calculatePotentialWinAmount(
  betTypeId: string,
  betVariant: string | undefined,
  denomination: number,
  lotteryData: LotteryData
): number {
  // Tìm loại cược từ dữ liệu
  const betType = lotteryData.betTypes.find((bt) => bt.id === betTypeId);
  if (!betType) {
    throw new Error(`Không tìm thấy loại cược với ID: ${betTypeId}`);
  }

  // Xác định tỷ lệ thưởng
  let winningRatio: number;

  if (typeof betType.winningRatio === "number") {
    winningRatio = betType.winningRatio;
  } else if (
    betVariant &&
    typeof betType.winningRatio[betVariant] === "number"
  ) {
    winningRatio = betType.winningRatio[betVariant] as number;
  } else if (
    betVariant &&
    typeof betType.winningRatio[betVariant] === "object"
  ) {
    // Xử lý đặc biệt cho cược "đá" - tính toán tỷ lệ thưởng phổ biến thay vì max
    const ratios = betType.winningRatio[betVariant] as Record<string, number>;

    if (betTypeId === "da") {
      // Với cược đá, dùng giá trị trường hợp phổ biến nhất cho từng biến thể
      if (betVariant === "da2") {
        // Đá 2 chỉ có một trường hợp
        winningRatio = ratios["2_numbers"] || 12.5;
      } else if (betVariant === "da3") {
        // Đá 3 dùng trường hợp "2_numbers_no_doubles" là phổ biến nhất
        winningRatio = ratios["2_numbers_no_doubles"] || 25;
      } else if (betVariant === "da4") {
        // Đá 4 dùng trường hợp "2_numbers_1_number_2_times" là phổ biến nhất
        winningRatio = ratios["2_numbers_1_number_2_times"] || 75;
      } else if (betVariant === "da5") {
        // Đá 5 dùng trường hợp "3_numbers_1_number_2_times" là phổ biến nhất
        winningRatio = ratios["3_numbers_1_number_2_times"] || 500;
      } else {
        // Fallback - lấy giá trị đầu tiên
        winningRatio = Object.values(ratios)[0];
      }
    } else {
      // Các loại cược khác có thể lấy giá trị tối thiểu đảm bảo an toàn
      winningRatio = Math.min(...Object.values(ratios));
    }
  } else {
    throw new Error(
      `Không thể xác định tỷ lệ thưởng cho biến thể ${betVariant}`
    );
  }

  // Tính tiền thưởng tiềm năng
  return denomination * winningRatio;
}

/**
 * Tạo hoán vị của một số
 */
export function generatePermutations(number: string): string[] {
  const digits = number.split("");
  const result: string[] = [];

  // Hàm đệ quy tạo hoán vị
  function permute(arr: string[], m: string[] = []) {
    if (arr.length === 0) {
      result.push(m.join(""));
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  }

  permute(digits);

  // Loại bỏ các hoán vị trùng lặp
  return [...new Set(result)];
}

/**
 * Map ngày trong tuần giữa tiếng Việt và tiếng Anh
 */
export const dayOfWeekMap: Record<string, string> = {
  "thu-hai": "Thứ Hai",
  "thu-ba": "Thứ Ba",
  "thu-tu": "Thứ Tư",
  "thu-nam": "Thứ Năm",
  "thu-sau": "Thứ Sáu",
  "thu-bay": "Thứ Bảy",
  "chu-nhat": "Chủ Nhật",
};

/**
 * Lấy ngày trong tuần dạng slug từ Date
 */
export function getDayOfWeekSlug(date: Date): string {
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
