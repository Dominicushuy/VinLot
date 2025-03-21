import { z } from "zod";

// Schema validation cho form sửa loại cược
export const betTypeSchema = z.object({
  id: z.string().optional(),
  bet_type_id: z.string().min(1, "ID loại cược không được để trống"),
  name: z.string().min(1, "Tên loại cược không được để trống"),
  description: z.string().optional(),
  digit_count: z.number().int().optional(),
  is_active: z.boolean().default(true),

  // Các trường JSONB
  region_rules: z.any(), // Định dạng phức tạp, validate thêm trong form
  variants: z.any().optional(),
  winning_ratio: z.any(), // Định dạng phức tạp, validate thêm trong form
});

export type BetTypeFormValues = z.infer<typeof betTypeSchema>;

// Schema validation cho biến thể cược
export const betTypeVariantSchema = z.object({
  id: z.string().min(1, "ID biến thể không được để trống"),
  name: z.string().min(1, "Tên biến thể không được để trống"),
  description: z.string().optional(),
  digit_count: z.number().int().optional(),
  number_count: z.number().int().optional(),
  is_active: z.boolean().default(true),
});

export type BetTypeVariantFormValues = z.infer<typeof betTypeVariantSchema>;

// Validator cho tỷ lệ thưởng
export const winningRatioValidator = (value: any): boolean => {
  // Kiểm tra nếu là số
  if (typeof value === "number") {
    return value > 0;
  }

  // Kiểm tra nếu là object
  if (typeof value === "object" && value !== null) {
    // Kiểm tra tất cả các giá trị trong object
    return Object.values(value).every((v) => {
      if (typeof v === "number") {
        return v > 0;
      }
      if (typeof v === "object" && v !== null) {
        return Object.values(v).every(
          (innerV) => typeof innerV === "number" && innerV > 0
        );
      }
      return false;
    });
  }

  return false;
};
