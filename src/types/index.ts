// Types cho các loại cược
export interface BetTypeVariant {
  id: string;
  name: string;
  description: string;
  digitCount?: number;
  numberCount?: number;
}

export interface BetTypeRegionRules {
  dau?: string;
  duoi?: string;
  [key: string]: string | undefined;
}

export interface BetTypeRegionMultipliers {
  [key: string]: number;
}

export interface BetTypeRegionCombinationCount {
  [key: string]: number;
}

export interface BetTypeRegion {
  id: string;
  name: string;
  betMultipliers: number | BetTypeRegionMultipliers;
  combinationCount: number | BetTypeRegionCombinationCount;
  winningRules: string | BetTypeRegionRules;
}

export interface BetTypeWinningRatio {
  [key: string]:
    | number
    | {
        [key: string]: number;
      };
}

export interface BetType {
  id: string;
  name: string;
  description: string;
  digitCount?: number;
  variants?: BetTypeVariant[];
  regions: BetTypeRegion[];
  winningRatio: number | BetTypeWinningRatio;
}

// Types cho phương thức chọn số
export interface ZodiacOption {
  id: string;
  name: string;
  value: number;
  numbers: string[];
}

export interface PermutationVariant {
  id: string;
  name: string;
  digitCount: number;
  maxPermutations: number;
}

export interface HighLowOption {
  id: string;
  name: string;
  description: string;
  range: [number, number];
}

export interface EvenOddOption {
  id: string;
  name: string;
  description: string;
  formula: string;
}

export interface SequenceVariant {
  id: string;
  name: string;
  description: string;
  example?: string;
  numbers?: string[];
}

export interface NumberSelectionMethod {
  id: string;
  name: string;
  description: string;
  options?: ZodiacOption[] | HighLowOption[] | EvenOddOption[];
  variants?: PermutationVariant[] | SequenceVariant[];
}

// Root interface
export interface LotteryData {
  betTypes: BetType[];
  numberSelectionMethods: NumberSelectionMethod[];
}

// Types cho kết quả xổ số
export interface MienBacResult {
  tinh: string;
  ngay: string;
  thu: string;
  loaiVe: string;
  ketQua: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
  };
}

export interface RegionalResult {
  tinh: string;
  maTinh: string;
  ketQua: {
    giaiDacBiet: string[];
    giaiNhat: string[];
    giaiNhi: string[];
    giaiBa: string[];
    giaiTu: string[];
    giaiNam: string[];
    giaiSau: string[];
    giaiBay: string[];
    giaiTam: string[];
  };
}

export interface MienTrungNamResult {
  ngay: string;
  thu: string;
  cacTinh: RegionalResult[];
}

// Interface cho cược
export interface Bet {
  id: string;
  userId: string;
  betDate: string;
  drawDate: string;
  regionType: "M1" | "M2";
  province: string;
  betType: string;
  betVariant?: string;
  numbers: string[];
  selectionMethod: string;
  denomination: number;
  totalAmount: number;
  potentialWinAmount: number;
  status: "pending" | "won" | "lost";
  winAmount?: number;
}

// Interface cho thông tin tỉnh/thành phố
export interface Province {
  id: string;
  province_id: string;
  name: string;
  code?: string;
  region: "mien-bac" | "mien-trung" | "mien-nam";
  region_type: "M1" | "M2";
  is_active: boolean;
  draw_days: string[];
}

// Định nghĩa chi tiết số trúng và phân tích
export interface WinningDetail {
  number: string;
  prize_type: string;
  prize_name: string;
  description: string;
  win_amount: number;
}

export interface WinningDetails {
  winning_numbers: string[];
  details: WinningDetail[];
}

// Cập nhật interface Bet
export interface Bet {
  id: string;
  userId: string;
  betDate: string;
  drawDate: string;
  regionType: "M1" | "M2";
  province: string;
  betType: string;
  betVariant?: string;
  numbers: string[];
  selectionMethod: string;
  denomination: number;
  totalAmount: number;
  potentialWinAmount: number;
  status: "pending" | "won" | "lost";
  winAmount?: number;
  winningDetails?: WinningDetails; // Thêm field này
}
