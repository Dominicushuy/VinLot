// src/lib/utils/result-saver.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Hàm lưu kết quả xổ số từ crawler vào database
 * @param results Mảng kết quả xổ số từ crawler
 */
export async function saveResultsToDatabase(results: any[]): Promise<void> {
  try {
    for (const resultItem of results) {
      const { region, data } = resultItem;

      if (!data || !data.duLieu) continue;

      const dayKey = Object.keys(data.duLieu)[0];
      if (!dayKey) continue;

      const regionData = data.duLieu[dayKey][region];
      if (!regionData) continue;

      // Kiểm tra cấu trúc dữ liệu theo miền
      if (region === "mien-bac") {
        // Cấu trúc riêng cho miền Bắc
        const { tinh, ngay, thu, ketQua } = regionData;
        if (!tinh || !ngay || !ketQua) continue;

        // Chuyển định dạng ngày - hỗ trợ cả hai định dạng
        let formattedDate: string;
        if (ngay.includes("/")) {
          // Định dạng dd/mm/yyyy
          const dateParts = ngay.split("/");
          formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else if (ngay.includes("-")) {
          // Định dạng yyyy-mm-dd
          formattedDate = ngay;
        } else {
          console.error(`Định dạng ngày không hợp lệ: ${ngay}`);
          continue;
        }

        // Kiểm tra nếu kết quả đã tồn tại
        const { data: existingResult, error: queryError } = await supabase
          .from("results")
          .select("id")
          .eq("province_id", "hanoi") // Miền Bắc mặc định là Hà Nội
          .eq("date", formattedDate)
          .maybeSingle();

        if (queryError && queryError.code !== "PGRST116") {
          // PGRST116 = không tìm thấy
          console.error(`Lỗi truy vấn kết quả miền Bắc: ${queryError.message}`);
          continue;
        }

        if (existingResult) {
          // Cập nhật kết quả
          const { error: updateError } = await supabase
            .from("results")
            .update({
              day_of_week: thu,
              special_prize: ketQua.giaiDacBiet,
              first_prize: ketQua.giaiNhat,
              second_prize: ketQua.giaiNhi,
              third_prize: ketQua.giaiBa,
              fourth_prize: ketQua.giaiTu,
              fifth_prize: ketQua.giaiNam,
              sixth_prize: ketQua.giaiSau,
              seventh_prize: ketQua.giaiBay,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingResult.id);

          if (updateError) {
            console.error(
              `Lỗi cập nhật kết quả miền Bắc: ${updateError.message}`
            );
          } else {
            console.log(`Đã cập nhật kết quả miền Bắc ngày ${formattedDate}`);
          }
        } else {
          // Thêm kết quả mới
          const { error: insertError } = await supabase.from("results").insert({
            province_id: "hanoi", // Miền Bắc mặc định là Hà Nội
            date: formattedDate,
            day_of_week: thu,
            special_prize: ketQua.giaiDacBiet,
            first_prize: ketQua.giaiNhat,
            second_prize: ketQua.giaiNhi,
            third_prize: ketQua.giaiBa,
            fourth_prize: ketQua.giaiTu,
            fifth_prize: ketQua.giaiNam,
            sixth_prize: ketQua.giaiSau,
            seventh_prize: ketQua.giaiBay,
          });

          if (insertError) {
            console.error(`Lỗi thêm kết quả miền Bắc: ${insertError.message}`);
          } else {
            console.log(`Đã thêm kết quả miền Bắc ngày ${formattedDate}`);
          }
        }
      } else {
        // Cấu trúc cho miền Trung và miền Nam
        const { ngay, thu, cacTinh } = regionData;
        if (!ngay || !cacTinh || !Array.isArray(cacTinh)) continue;

        // Chuyển định dạng ngày - hỗ trợ cả hai định dạng
        let formattedDate: string;
        if (ngay.includes("/")) {
          // Định dạng dd/mm/yyyy
          const dateParts = ngay.split("/");
          formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else if (ngay.includes("-")) {
          // Định dạng yyyy-mm-dd
          formattedDate = ngay;
        } else {
          console.error(`Định dạng ngày không hợp lệ: ${ngay}`);
          continue;
        }

        // Lưu kết quả cho từng tỉnh
        for (const tinhData of cacTinh) {
          const { tinh, ketQua } = tinhData;
          if (!tinh || !ketQua) continue;

          // Tìm province_id tương ứng từ tên tỉnh
          const { data: provinceData, error: provinceError } = await supabase
            .from("provinces")
            .select("province_id")
            .ilike("name", `%${tinh}%`)
            .limit(1)
            .maybeSingle();

          if (provinceError) {
            console.error(
              `Lỗi tìm province_id cho ${tinh}: ${provinceError.message}`
            );
            continue;
          }

          if (!provinceData) {
            console.warn(`Không tìm thấy tỉnh: ${tinh}`);
            continue;
          }

          // Kiểm tra nếu kết quả đã tồn tại
          const { data: existingResult, error: queryError } = await supabase
            .from("results")
            .select("id")
            .eq("province_id", provinceData.province_id)
            .eq("date", formattedDate)
            .maybeSingle();

          if (queryError && queryError.code !== "PGRST116") {
            // PGRST116 = không tìm thấy
            console.error(
              `Lỗi truy vấn kết quả tỉnh ${tinh}: ${queryError.message}`
            );
            continue;
          }

          if (existingResult) {
            // Cập nhật kết quả
            const { error: updateError } = await supabase
              .from("results")
              .update({
                day_of_week: thu,
                special_prize: ketQua.giaiDacBiet,
                first_prize: ketQua.giaiNhat,
                second_prize: ketQua.giaiNhi,
                third_prize: ketQua.giaiBa,
                fourth_prize: ketQua.giaiTu,
                fifth_prize: ketQua.giaiNam,
                sixth_prize: ketQua.giaiSau,
                seventh_prize: ketQua.giaiBay,
                eighth_prize: ketQua.giaiTam,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingResult.id);

            if (updateError) {
              console.error(
                `Lỗi cập nhật kết quả tỉnh ${tinh}: ${updateError.message}`
              );
            } else {
              console.log(
                `Đã cập nhật kết quả tỉnh ${tinh} ngày ${formattedDate}`
              );
            }
          } else {
            // Thêm kết quả mới
            const { error: insertError } = await supabase
              .from("results")
              .insert({
                province_id: provinceData.province_id,
                date: formattedDate,
                day_of_week: thu,
                special_prize: ketQua.giaiDacBiet,
                first_prize: ketQua.giaiNhat,
                second_prize: ketQua.giaiNhi,
                third_prize: ketQua.giaiBa,
                fourth_prize: ketQua.giaiTu,
                fifth_prize: ketQua.giaiNam,
                sixth_prize: ketQua.giaiSau,
                seventh_prize: ketQua.giaiBay,
                eighth_prize: ketQua.giaiTam,
              });

            if (insertError) {
              console.error(
                `Lỗi thêm kết quả tỉnh ${tinh}: ${insertError.message}`
              );
            } else {
              console.log(`Đã thêm kết quả tỉnh ${tinh} ngày ${formattedDate}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Lỗi lưu kết quả vào database:", error);
    throw error;
  }
}
