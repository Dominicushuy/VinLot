// src/lib/utils/result-saver.ts
import { supabase } from "@/lib/supabase/client";

/**
 * Chuẩn hóa tên tỉnh để dễ so sánh (bỏ dấu, lowercase, bỏ khoảng trắng)
 * @param name - Tên tỉnh cần chuẩn hóa
 * @returns Tên tỉnh đã chuẩn hóa
 */
function normalizeProvinceName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/\s+/g, "");
}

/**
 * Tạo mapping giữa tên tỉnh hiển thị và tên tỉnh trong database
 */
const provinceMapping: Record<string, string> = {
  "hà nội": "hanoi",
  "hải phòng": "haiphong",
  "quảng ninh": "quangninh",
  "bắc ninh": "bacninh",
  "nam định": "namdinh",
  "thái bình": "thaibinh",
  "phú yên": "phuyen",
  "thừa t. huế": "thuathienhue",
  "thừa thiên huế": "thuathienhue",
  "đắk lắk": "daklak",
  "quảng nam": "quangnam",
  "đà nẵng": "danang",
  "khánh hòa": "khanhhoa",
  "gia lai": "gialai",
  "ninh thuận": "ninhthuan",
  "tp. hcm": "tphcm",
  "đồng tháp": "dongthap",
  "cà mau": "camau",
  "bến tre": "bentre",
  "vũng tàu": "vungtau",
  "bạc liêu": "baclieu",
  "đồng nai": "dongnai",
  "cần thơ": "cantho",
  "sóc trăng": "soctrang",
  "tây ninh": "tayninh",
  "an giang": "angiang",
  "bình thuận": "binhthuan",
  "vĩnh long": "vinhlong",
  "bình dương": "binhduong",
  "trà vinh": "travinh",
  "long an": "longan",
  "bình phước": "binhphuoc",
  "hậu giang": "haugiang",
  "tiền giang": "tiengiang",
  "kiên giang": "kiengiang",
  "đà lạt": "dalat",
  "quảng bình": "quangbinh",
  "quảng trị": "quangtri",
  "bình định": "binhdinh",
  "kon tum": "kontum",
  "đắk nông": "daknong",
  "quảng ngãi": "quangngai",
};

/**
 * Tìm province_id từ tên tỉnh
 * @param provinceName - Tên tỉnh từ kết quả xổ số
 * @returns province_id tương ứng hoặc null nếu không tìm thấy
 */
async function findProvinceId(provinceName: string): Promise<string | null> {
  try {
    // Normalize tên tỉnh
    const normalizedName = normalizeProvinceName(provinceName);

    // 1. Kiểm tra trong mapping trước
    for (const [key, value] of Object.entries(provinceMapping)) {
      if (normalizeProvinceName(key) === normalizedName) {
        return value;
      }
    }

    // 2. Tìm trong database với ilike cả normalized và original
    const { data: provinceData, error: provinceError } = await supabase
      .from("provinces")
      .select("province_id")
      .or(`name.ilike.%${provinceName}%,province_id.ilike.%${normalizedName}%`)
      .limit(1)
      .maybeSingle();

    if (provinceError) {
      console.error(
        `Lỗi tìm province_id cho ${provinceName}: ${provinceError.message}`
      );
      return null;
    }

    if (!provinceData) {
      // 3. Thử tìm bằng cách so sánh tên đã normalize
      const { data: allProvinces, error: allProvincesError } = await supabase
        .from("provinces")
        .select("province_id, name");

      if (allProvincesError) {
        console.error(
          `Lỗi lấy danh sách provinces: ${allProvincesError.message}`
        );
        return null;
      }

      // So sánh tên đã normalize
      const matchingProvince = allProvinces.find(
        (p) => normalizeProvinceName(p.name) === normalizedName
      );

      if (matchingProvince) {
        return matchingProvince.province_id;
      }

      console.warn(
        `Không tìm thấy tỉnh sau khi thử nhiều cách: ${provinceName}`
      );
      return null;
    }

    return provinceData.province_id;
  } catch (error) {
    console.error(`Lỗi xử lý tìm province_id: ${error}`);
    return null;
  }
}

/**
 * Hàm lưu kết quả xổ số từ crawler vào database
 * @param results Mảng kết quả xổ số từ crawler
 */
export async function saveResultsToDatabase(results: any[]): Promise<void> {
  try {
    console.log(`Bắt đầu lưu ${results.length} kết quả vào database...`);

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

        console.log(`Đang xử lý kết quả miền Bắc: ${tinh} ngày ${ngay}`);

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

        // Tìm province_id cho miền Bắc
        const provinceId = (await findProvinceId(tinh)) || "hanoi";
        console.log(`Tỉnh ${tinh} → province_id: ${provinceId}`);

        // Kiểm tra nếu kết quả đã tồn tại
        const { data: existingResult, error: queryError } = await supabase
          .from("results")
          .select("id")
          .eq("province_id", provinceId)
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
            province_id: provinceId,
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
        if (!ngay || !cacTinh || !Array.isArray(cacTinh)) {
          console.log(
            `Không tìm thấy kết quả hoặc danh sách tỉnh cho ${region}`
          );
          continue;
        }

        console.log(
          `Đang xử lý ${cacTinh.length} tỉnh cho ${region} ngày ${ngay}`
        );

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

          console.log(`Đang xử lý tỉnh: ${tinh}`);

          // Tìm province_id tương ứng từ tên tỉnh
          const provinceId = await findProvinceId(tinh);
          if (!provinceId) {
            console.warn(`Không tìm thấy tỉnh: ${tinh}`);
            continue;
          }

          console.log(`Tỉnh ${tinh} → province_id: ${provinceId}`);

          // Kiểm tra nếu kết quả đã tồn tại
          const { data: existingResult, error: queryError } = await supabase
            .from("results")
            .select("id")
            .eq("province_id", provinceId)
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
                province_id: provinceId,
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

    console.log("Hoàn thành việc lưu kết quả vào database!");
  } catch (error) {
    console.error("Lỗi lưu kết quả vào database:", error);
    throw error;
  }
}
