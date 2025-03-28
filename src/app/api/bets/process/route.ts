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
    const processedBets: Array<{
      id: string;
      status: string;
      win_amount: number;
      winning_details: any;
    }> = [];
    const transactions: Array<{
      user_id: string;
      bet_id: string;
      amount: number;
      type: string;
      status: string;
      description: string;
    }> = [];
    let totalWinAmount = 0;

    for (const bet of pendingBets as any[]) {
      // Kiểm tra nếu có kết quả xổ số cho tỉnh của cược
      const provinceResults = results.filter(
        (r) => r.province_id === bet.province_id
      );

      if (provinceResults.length === 0) {
        continue; // Bỏ qua nếu chưa có kết quả cho tỉnh này
      }

      // Tìm loại cược
      const betType = betTypes?.find((bt) => bt.bet_type_id === bet.bet_type);
      if (!betType) continue;

      // Parse các trường JSONB từ database nếu cần
      const betTypeWithParsedFields = {
        ...betType,
        region_rules:
          typeof betType.region_rules === "string"
            ? JSON.parse(betType.region_rules)
            : betType.region_rules,
        variants:
          typeof betType.variants === "string"
            ? JSON.parse(betType.variants)
            : betType.variants,
        winning_ratio:
          typeof betType.winning_ratio === "string"
            ? JSON.parse(betType.winning_ratio)
            : betType.winning_ratio,
      };

      // Đối soát kết quả
      const { winAmount, winningDetails } = checkBetResult(
        bet,
        provinceResults[0],
        betTypeWithParsedFields
      );

      // Cập nhật trạng thái cược
      const status = winAmount > 0 ? "won" : "lost";

      processedBets.push({
        id: bet.id,
        status,
        win_amount: winAmount,
        winning_details: winningDetails,
      });

      // Tính tổng tiền thắng
      if (winAmount > 0) {
        totalWinAmount += winAmount;

        // Tạo giao dịch nếu thắng
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
          winning_details: bet.winning_details,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);
    }

    // 6. Tạo giao dịch cho các cược thắng
    if (transactions.length > 0) {
      await supabase.from("transactions").insert(transactions);

      // 7. Cập nhật số dư người dùng
      for (const transaction of transactions) {
        const { data: userData } = await supabase
          .from("users")
          .select("balance")
          .eq("id", transaction.user_id)
          .single();

        // Chắc chắn rằng userData không null trước khi truy cập properties
        if (userData) {
          const user = userData as { balance: number };

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

    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
      totalWinAmount,
      total: pendingBets.length,
    });
  } catch (error: any) {
    console.error("Lỗi khi đối soát cược:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
