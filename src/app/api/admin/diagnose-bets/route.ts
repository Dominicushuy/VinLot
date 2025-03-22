// src/app/api/admin/diagnose-bets/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    console.log("Starting bet diagnostics");

    // 1. Kiểm tra số lượng các cược đang chờ
    const {
      data: pendingBets,
      error: betsError,
      count,
    } = await supabase
      .from("bets")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .limit(10); // Lấy tối đa 10 cược để phân tích

    if (betsError) {
      console.error("Error fetching pending bets:", betsError);
      return NextResponse.json(
        { error: "Không thể lấy danh sách cược" },
        { status: 500 }
      );
    }

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({
        status: "no_bets",
        message: "Không có cược cần đối soát",
      });
    }

    console.log(
      `Found ${count || 0} pending bets, examining ${pendingBets.length}`
    );

    // 2. Phân tích dữ liệu cược
    const diagnostics = {
      total_pending: count,
      samples_examined: pendingBets.length,
      draw_dates: [],
      provinces: [],
      bet_types: [],
      results_available: 0,
      bet_details: [],
      issues: [],
    };

    // Thu thập các ngày xổ và tỉnh cần kiểm tra
    const drawDates = [...new Set(pendingBets.map((bet) => bet.draw_date))];
    diagnostics.draw_dates = drawDates;

    const provinceIds = [...new Set(pendingBets.map((bet) => bet.province_id))];
    diagnostics.provinces = provinceIds;

    const betTypeIds = [...new Set(pendingBets.map((bet) => bet.bet_type))];
    diagnostics.bet_types = betTypeIds;

    // 3. Kiểm tra có kết quả xổ số cho các ngày và tỉnh này không
    let resultsFound = 0;
    const missingResults = [];

    for (const date of drawDates) {
      for (const provinceId of provinceIds) {
        const { data: results, error } = await supabase
          .from("results")
          .select("*")
          .eq("date", date)
          .eq("province_id", provinceId);

        if (error) {
          diagnostics.issues.push({
            type: "database_error",
            context: `Lỗi khi truy vấn kết quả xổ số cho ${provinceId} ngày ${date}`,
            detail: error.message,
          });
        } else if (results && results.length > 0) {
          resultsFound++;
        } else {
          missingResults.push({ date, provinceId });
        }
      }
    }

    diagnostics.results_available = resultsFound;

    if (missingResults.length > 0) {
      diagnostics.issues.push({
        type: "missing_results",
        context: "Không tìm thấy kết quả xổ số cho các tỉnh và ngày sau",
        detail: missingResults,
      });
    }

    // 4. Kiểm tra các loại cược
    const { data: betTypes, error: betTypesError } = await supabase
      .from("rules")
      .select("*");

    if (betTypesError) {
      diagnostics.issues.push({
        type: "database_error",
        context: "Lỗi khi truy vấn thông tin loại cược",
        detail: betTypesError.message,
      });
    }

    if (!betTypes || betTypes.length === 0) {
      diagnostics.issues.push({
        type: "missing_bet_types",
        context: "Không tìm thấy thông tin loại cược",
        detail: "Bảng 'rules' không có dữ liệu hoặc không thể truy cập",
      });
    } else {
      // Kiểm tra các loại cược còn thiếu
      const missingBetTypes = betTypeIds.filter(
        (id) => !betTypes.some((bt) => bt.bet_type_id === id)
      );

      if (missingBetTypes.length > 0) {
        diagnostics.issues.push({
          type: "unknown_bet_types",
          context: "Một số loại cược không tồn tại trong database",
          detail: missingBetTypes,
        });
      }

      // Kiểm tra cấu trúc dữ liệu JSONB
      for (const bt of betTypes) {
        if (bt.region_rules) {
          try {
            const regionRules =
              typeof bt.region_rules === "string"
                ? JSON.parse(bt.region_rules)
                : bt.region_rules;

            // Kiểm tra cấu trúc hợp lệ
            if (!regionRules.M1 && !regionRules.M2) {
              diagnostics.issues.push({
                type: "invalid_json_structure",
                context: `Loại cược ${bt.bet_type_id} có cấu trúc region_rules không hợp lệ`,
                detail: "Thiếu cấu trúc M1/M2",
              });
            }
          } catch (e) {
            diagnostics.issues.push({
              type: "invalid_json",
              context: `Loại cược ${bt.bet_type_id} có JSON không hợp lệ cho region_rules`,
              detail: e.message,
            });
          }
        }

        if (bt.winning_ratio) {
          try {
            typeof bt.winning_ratio === "string"
              ? JSON.parse(bt.winning_ratio)
              : bt.winning_ratio;
          } catch (e) {
            diagnostics.issues.push({
              type: "invalid_json",
              context: `Loại cược ${bt.bet_type_id} có JSON không hợp lệ cho winning_ratio`,
              detail: e.message,
            });
          }
        }

        if (bt.variants) {
          try {
            typeof bt.variants === "string"
              ? JSON.parse(bt.variants)
              : bt.variants;
          } catch (e) {
            diagnostics.issues.push({
              type: "invalid_json",
              context: `Loại cược ${bt.bet_type_id} có JSON không hợp lệ cho variants`,
              detail: e.message,
            });
          }
        }
      }
    }

    // 5. Chi tiết từng phiếu và vấn đề tiềm ẩn
    for (const bet of pendingBets) {
      const betDetail = {
        id: bet.id,
        draw_date: bet.draw_date,
        province_id: bet.province_id,
        bet_type: bet.bet_type,
        issues: [],
      };

      // Kiểm tra phiếu này có kết quả xổ số chưa
      const { data: results } = await supabase
        .from("results")
        .select("*")
        .eq("date", bet.draw_date)
        .eq("province_id", bet.province_id);

      if (!results || results.length === 0) {
        betDetail.issues.push({
          type: "no_results",
          detail: `Chưa có kết quả xổ số cho ${bet.province_id} ngày ${bet.draw_date}`,
        });
      }

      // Kiểm tra loại cược có tồn tại và hợp lệ
      const betType = betTypes?.find((bt) => bt.bet_type_id === bet.bet_type);
      if (!betType) {
        betDetail.issues.push({
          type: "unknown_bet_type",
          detail: `Loại cược ${bet.bet_type} không tồn tại trong database`,
        });
      } else {
        // Kiểm tra loại cược có hỗ trợ vùng miền của phiếu không
        try {
          const regionRules =
            typeof betType.region_rules === "string"
              ? JSON.parse(betType.region_rules)
              : betType.region_rules;

          if (!regionRules[bet.region_type]) {
            betDetail.issues.push({
              type: "unsupported_region",
              detail: `Loại cược ${bet.bet_type} không hỗ trợ miền ${bet.region_type}`,
            });
          }
        } catch (e) {
          betDetail.issues.push({
            type: "json_parse_error",
            detail: `Không thể parse region_rules cho loại cược ${bet.bet_type}: ${e.message}`,
          });
        }

        // Kiểm tra biến thể cược có hợp lệ
        if (bet.bet_variant) {
          try {
            const variants =
              typeof betType.variants === "string"
                ? JSON.parse(betType.variants)
                : betType.variants;

            if (
              !variants ||
              !Array.isArray(variants) ||
              !variants.some((v) => v.id === bet.bet_variant)
            ) {
              betDetail.issues.push({
                type: "invalid_variant",
                detail: `Biến thể cược ${bet.bet_variant} không hợp lệ cho loại cược ${bet.bet_type}`,
              });
            }
          } catch (e) {
            betDetail.issues.push({
              type: "json_parse_error",
              detail: `Không thể parse variants cho loại cược ${bet.bet_type}: ${e.message}`,
            });
          }
        }
      }

      // Thêm vào danh sách phân tích
      diagnostics.bet_details.push(betDetail);
    }

    // 6. Tổng hợp kết quả và đề xuất giải pháp
    const suggestions = [];

    if (diagnostics.issues.some((i) => i.type === "missing_results")) {
      suggestions.push(
        "Cần cập nhật kết quả xổ số cho các tỉnh và ngày còn thiếu bằng cách sử dụng crawler hoặc nhập thủ công"
      );
    }

    if (
      diagnostics.issues.some(
        (i) => i.type === "invalid_json" || i.type === "invalid_json_structure"
      )
    ) {
      suggestions.push(
        "Kiểm tra và sửa cấu trúc JSON không hợp lệ trong bảng rules"
      );
    }

    if (diagnostics.issues.some((i) => i.type === "unknown_bet_types")) {
      suggestions.push("Thêm các loại cược còn thiếu vào bảng rules");
    }

    return NextResponse.json({
      status: "completed",
      diagnostics,
      suggestions,
    });
  } catch (error: any) {
    console.error("Error during bet diagnostics:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
