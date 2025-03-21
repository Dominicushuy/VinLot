// src/lib/validators/province-validator.ts

import { z } from "zod";

// Schema validation cho form đài xổ số
export const provinceSchema = z.object({
  id: z.string().optional(),
  province_id: z.string().min(1, "ID tỉnh không được để trống"),
  name: z.string().min(1, "Tên tỉnh không được để trống"),
  code: z.string().optional(),
  region: z.enum(["mien-bac", "mien-trung", "mien-nam"], {
    required_error: "Vui lòng chọn miền",
  }),
  region_type: z.enum(["M1", "M2"], {
    required_error: "Vui lòng chọn loại miền",
  }),
  draw_days: z.array(z.string()).min(1, "Vui lòng chọn ít nhất 1 ngày xổ số"),
  is_active: z.boolean().default(true),
});

export type ProvinceFormValues = z.infer<typeof provinceSchema>;
