// src/app/api/admin/process-all-pending/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResult } from "@/lib/utils/bet-result-processor";

export async function POST() {
  try {
    console.log("Starting process-all-pending");

    // 1. Lấy tất cả các cược đang chờ kết quả (với giới hạn 100 cược một lần để tránh timeout)
    const {
      data: pendingBets,
      error: betsError,
      count,
    } = await supabase
      .from("bets")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .limit(100);

    if (betsError) {
      console.error("Error fetching pending bets:", betsError);
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`);
    }

    console.log(
      `Found ${count || 0} pending bets, processing ${pendingBets?.length || 0}`
    );

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({
        message: "Không có cược cần đối soát",
        processed: 0,
        won: 0,
      });
    }

    // 2. Lấy tất cả kết quả xổ số (chỉ lấy theo các ngày cần thiết)
    const drawDates = [...new Set(pendingBets.map((bet) => bet.draw_date))];

    let allResults = [];
    for (const date of drawDates) {
      const { data: results } = await supabase
        .from("results")
        .select("*")
        .eq("date", date);

      if (results && results.length > 0) {
        allResults = [...allResults, ...results];
      }
    }

    console.log(
      `Fetched ${allResults.length} lottery results for ${drawDates.length} dates`
    );

    if (allResults.length === 0) {
      return NextResponse.json({
        message: "Chưa có kết quả xổ số cho các ngày cần đối soát",
        processed: 0,
        won: 0,
      });
    }

    // 3. Lấy thông tin loại cược
    const { data: betTypes, error: betTypesError } = await supabase
      .from("rules")
      .select("*");

    if (betTypesError) {
      console.error("Error fetching bet types:", betTypesError);
      throw new Error(
        `Lỗi khi lấy thông tin loại cược: ${betTypesError.message}`
      );
    }

    // 4. Đối soát từng cược
    const processedBets = [];
    const transactions = [];

    for (const bet of pendingBets) {
      console.log(
        `Processing bet ID: ${bet.id}, type: ${bet.bet_type}, province: ${bet.province_id}`
      );

      // Tìm kết quả xổ số cho ngày và tỉnh của cược
      const provinceResults = allResults.filter(
        (r) => r.province_id === bet.province_id && r.date === bet.draw_date
      );

      if (provinceResults.length === 0) {
        console.log(
          `No results found for province ${bet.province_id} on date ${bet.draw_date}`
        );
        continue; // Bỏ qua nếu chưa có kết quả cho tỉnh và ngày này
      }

      // Tìm loại cược
      const betType = betTypes.find((bt) => bt.bet_type_id === bet.bet_type);
      if (!betType) {
        console.log(`Bet type not found: ${bet.bet_type}`);
        continue;
      }

      // Đối soát kết quả
      try {
        const winAmount = checkBetResult(bet, provinceResults[0], betType);

        // Cập nhật trạng thái cược
        const status = winAmount > 0 ? "won" : "lost";

        processedBets.push({
          id: bet.id,
          status,
          win_amount: winAmount,
        });

        console.log(
          `Bet ${bet.id} processed: ${status}, win amount: ${winAmount}`
        );

        // Tạo giao dịch nếu thắng
        if (winAmount > 0) {
          transactions.push({
            user_id: bet.user_id,
            bet_id: bet.id,
            amount: winAmount,
            type: "win",
            status: "completed",
            description: `Thắng cược ${bet.bet_type} ngày ${bet.draw_date}`,
          });
        }
      } catch (error) {
        console.error(`Error processing bet ${bet.id}:`, error);
        // Continue with other bets even if one fails
      }
    }

    console.log(
      `Successfully processed ${processedBets.length} bets, ${transactions.length} winning bets`
    );

    // 5. Cập nhật các cược trong database
    for (const bet of processedBets) {
      const { error: updateError } = await supabase
        .from("bets")
        .update({
          status: bet.status,
          win_amount: bet.win_amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);

      if (updateError) {
        console.error(`Error updating bet ${bet.id}:`, updateError);
      }
    }

    // 6. Tạo giao dịch cho các cược thắng
    if (transactions.length > 0) {
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert(transactions);

      if (transactionError) {
        console.error("Error creating transactions:", transactionError);
      } else {
        // 7. Cập nhật số dư người dùng
        for (const transaction of transactions) {
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("balance")
            .eq("id", transaction.user_id)
            .single();

          if (userError) {
            console.error(
              `Error fetching user ${transaction.user_id}:`,
              userError
            );
            continue;
          }

          if (user) {
            const { error: updateUserError } = await supabase
              .from("users")
              .update({
                balance: user.balance + transaction.amount,
                updated_at: new Date().toISOString(),
              })
              .eq("id", transaction.user_id);

            if (updateUserError) {
              console.error(
                `Error updating user balance ${transaction.user_id}:`,
                updateUserError
              );
            }
          }
        }
      }
    }

    // Trả về kết quả đối soát
    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
      total: count || pendingBets.length,
    });
  } catch (error: any) {
    console.error("Error processing all pending bets:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
