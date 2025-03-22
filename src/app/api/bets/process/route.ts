// src/app/api/bets/process/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResult } from "@/lib/utils/bet-result-processor";

export async function POST(request: Request) {
  try {
    const { date } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Cần cung cấp ngày" }, { status: 400 });
    }

    // 1. Lấy các cược đang chờ kết quả
    const { data: pendingBets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("draw_date", date)
      .eq("status", "pending");

    if (betsError) {
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`);
    }

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({ message: "Không có cược cần đối soát" });
    }

    // 2. Lấy kết quả xổ số
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

    // 5. Cập nhật các cược
    for (const bet of processedBets) {
      await supabase
        .from("bets")
        .update({
          status: bet.status,
          win_amount: bet.win_amount,
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

        await supabase
          .from("users")
          .update({
            balance: user.balance + transaction.amount,
          })
          .eq("id", transaction.user_id);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
    });
  } catch (error: any) {
    console.error("Lỗi khi đối soát cược:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
