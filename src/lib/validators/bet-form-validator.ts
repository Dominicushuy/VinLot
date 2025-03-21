import { z } from "zod";

// Schema validation cho form đặt cược
export const betFormSchema = z.object({
  // Ngày cược và xổ
  betDate: z.date({
    required_error: "Vui lòng chọn ngày đặt cược",
  }),
  drawDate: z.date({
    required_error: "Vui lòng chọn ngày xổ",
  }),

  // Miền và tỉnh
  regionType: z.enum(["M1", "M2"], {
    required_error: "Vui lòng chọn miền",
  }),
  provinces: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 tỉnh/thành"),

  // Loại cược
  betType: z.string({
    required_error: "Vui lòng chọn loại cược",
  }),
  betVariant: z.string().optional(),

  // Phương thức chọn số và số cược
  selectionMethod: z.string({
    required_error: "Vui lòng chọn phương thức chọn số",
  }),
  numbers: z.array(z.string()).min(1, "Vui lòng nhập ít nhất 1 số cược"),

  // Thông tin tiền cược
  denomination: z
    .number({
      required_error: "Vui lòng nhập mệnh giá",
    })
    .min(1000, "Mệnh giá tối thiểu là 1,000đ")
    .max(100000000, "Mệnh giá tối đa là 100,000,000đ"),
});

// Type cho form đặt cược
export type BetFormValues = z.infer<typeof betFormSchema>;

// Validate số cược dựa trên loại cược
export function validateBetNumbers(
  numbers: string[],
  betType: string,
  betVariant?: string
): boolean {
  // Lấy số chữ số cần thiết dựa trên loại cược và biến thể
  const digitCount = getBetTypeDigitCount(betType, betVariant);

  // Validate từng số
  return numbers.every((number) => {
    // Kiểm tra định dạng số
    if (!/^\d+$/.test(number)) return false;

    // Kiểm tra số chữ số
    return number.length === digitCount;
  });
}

// Helper function để lấy số chữ số cần thiết cho mỗi loại cược
function getBetTypeDigitCount(betType: string, betVariant?: string): number {
  switch (betType) {
    case "dd":
    case "nt":
    case "xien":
    case "da":
      return 2;

    case "xc":
      return 3;

    case "bao_lo":
      if (betVariant === "b2") return 2;
      if (betVariant === "b3") return 3;
      if (betVariant === "b4") return 4;
      return 2;

    case "b7l":
    case "b8l":
      if (betVariant === "b7l2" || betVariant === "b8l2") return 2;
      if (betVariant === "b7l3" || betVariant === "b8l3") return 3;
      if (betVariant === "b7l4" || betVariant === "b8l4") return 4;
      return 2;

    default:
      return 2;
  }
}
