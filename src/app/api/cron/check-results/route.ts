// src/app/api/cron/check-results/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResult } from "@/lib/utils/bet-result-processor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Lấy ngày hôm nay
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    // 1. Lấy các cược đang chờ kết quả
    const { data: pendingBets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "pending")
      .lte("draw_date", formattedDate); // Chỉ lấy các cược có ngày xổ <= ngày hiện tại

    if (betsError) {
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`);
    }

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({ message: "Không có cược cần đối soát" });
    }

    // Nhóm cược theo ngày xổ
    const betsByDate = pendingBets.reduce((acc, bet) => {
      if (!acc[bet.draw_date]) {
        acc[bet.draw_date] = [];
      }
      acc[bet.draw_date].push(bet);
      return acc;
    }, {});

    // 2. Lấy thông tin loại cược
    const { data: betTypes, error: betTypesError } = await supabase
      .from("rules")
      .select("*");

    if (betTypesError) {
      throw new Error(
        `Lỗi khi lấy thông tin loại cược: ${betTypesError.message}`
      );
    }

    // 3. Đối soát từng ngày
    const result = {
      success: true,
      processed: 0,
      won: 0,
      dates: {},
    };

    for (const [date, bets] of Object.entries(betsByDate)) {
      // Lấy kết quả xổ số cho ngày này
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .eq("date", date);

      if (resultsError) {
        console.error(`Lỗi khi lấy kết quả xổ số: ${resultsError.message}`);
        continue;
      }

      if (!results || results.length === 0) {
        console.log(`Chưa có kết quả xổ số cho ngày ${date}`);
        continue;
      }

      // Đối soát từng cược
      const processedBets = [];
      const transactions = [];

      for (const bet of bets) {
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

      // Cập nhật các cược
      for (const bet of processedBets) {
        await supabase
          .from("bets")
          .update({
            status: bet.status,
            win_amount: bet.win_amount,
          })
          .eq("id", bet.id);
      }

      // Tạo giao dịch cho các cược thắng
      if (transactions.length > 0) {
        await supabase.from("transactions").insert(transactions);

        // Cập nhật số dư người dùng
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

      // Cập nhật kết quả
      result.processed += processedBets.length;
      result.won += transactions.length;
      result.dates[date] = {
        processed: processedBets.length,
        won: transactions.length,
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Lỗi khi đối soát cược:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
