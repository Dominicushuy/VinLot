import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResult } from "@/lib/utils/bet-result-processor";

export async function POST(request: Request) {
  try {
    const { date, betType, provinceId } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: "Ngày đối soát là bắt buộc" },
        { status: 400 }
      );
    }

    // 1. Lấy các cược đang chờ kết quả theo ngày
    let query = supabase
      .from("bets")
      .select("*")
      .eq("draw_date", date)
      .eq("status", "pending");

    // Thêm filter nếu có
    if (betType) {
      query = query.eq("bet_type", betType);
    }

    if (provinceId) {
      query = query.eq("province_id", provinceId);
    }

    const { data: pendingBets, error: betsError } = await query;

    if (betsError) {
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`);
    }

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({
        message: "Không có cược cần đối soát",
        processed: 0,
        won: 0,
      });
    }

    // 2. Lấy kết quả xổ số cho ngày này
    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .eq("date", date);

    if (resultsError) {
      throw new Error(`Lỗi khi lấy kết quả xổ số: ${resultsError.message}`);
    }

    if (!results || results.length === 0) {
      return NextResponse.json({
        message: "Chưa có kết quả xổ số cho ngày này",
        processed: 0,
        won: 0,
        status: "pending",
      });
    }

    // 3. Lấy thông tin loại cược
    const { data: betTypes, error: betTypesError } = await supabase
      .from("rules")
      .select("*");

    if (betTypesError) {
      throw new Error(
        `Lỗi khi lấy thông tin loại cược: ${betTypesError.message}`
      );
    }

    // 4. Đối soát từng cược
    const processedBets = [];
    const transactions = [];
    const details = [];

    for (const bet of pendingBets) {
      // Kiểm tra nếu có kết quả xổ số cho tỉnh của cược
      const provinceResults = results.filter(
        (r) => r.province_id === bet.province_id
      );

      if (provinceResults.length === 0) {
        continue; // Bỏ qua nếu chưa có kết quả cho tỉnh này
      }

      // Tìm loại cược
      const betType = betTypes.find((bt) => bt.bet_type_id === bet.bet_type);
      if (!betType) continue;

      // Đối soát kết quả
      const winAmount = checkBetResult(bet, provinceResults[0], betType);

      // Cập nhật trạng thái cược
      const status = winAmount > 0 ? "won" : "lost";

      processedBets.push({
        id: bet.id,
        status,
        win_amount: winAmount,
      });

      // Lưu chi tiết cho response
      details.push({
        bet_id: bet.id,
        province_id: bet.province_id,
        bet_type: bet.bet_type,
        numbers: bet.numbers,
        status,
        win_amount: winAmount,
      });

      // Tạo giao dịch nếu thắng
      if (winAmount > 0) {
        transactions.push({
          user_id: bet.user_id,
          bet_id: bet.id,
          amount: winAmount,
          type: "win",
          status: "completed",
          description: `Thắng cược ${bet.bet_type} ngày ${date}`,
        });
      }
    }

    // 5. Cập nhật các cược trong database
    for (const bet of processedBets) {
      await supabase
        .from("bets")
        .update({
          status: bet.status,
          win_amount: bet.win_amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);
    }

    // 6. Tạo giao dịch cho các cược thắng
    if (transactions.length > 0) {
      await supabase.from("transactions").insert(transactions);

      // 7. Cập nhật số dư người dùng
      for (const transaction of transactions) {
        const { data: user } = await supabase
          .from("users")
          .select("balance")
          .eq("id", transaction.user_id)
          .single();

        if (user) {
          await supabase
            .from("users")
            .update({
              balance: user.balance + transaction.amount,
              updated_at: new Date().toISOString(),
            })
            .eq("id", transaction.user_id);
        }
      }
    }

    // Trả về kết quả đối soát
    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
      details: details.slice(0, 50), // Giới hạn số lượng chi tiết để tránh response quá lớn
    });
  } catch (error: any) {
    console.error("Lỗi khi đối soát cược:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
