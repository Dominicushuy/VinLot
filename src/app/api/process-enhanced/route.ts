// src/app/api/admin/process-enhanced/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResultEnhanced } from "@/lib/utils/improved-bet-result-processor";

export async function POST() {
  try {
    console.log("Starting enhanced process-all-pending");
    const startTime = Date.now();

    // 1. Lấy tổng số cược pending để báo cáo
    const { count: totalPending } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    console.log(`Tổng số cược đang chờ: ${totalPending || 0}`);

    // 2. Lấy danh sách cược đang chờ với giới hạn nhỏ hơn để xử lý nhanh hơn
    const { data: pendingBets, error: betsError } = await supabase
      .from("bets")
      .select("*")
      .eq("status", "pending")
      .limit(50); // Giới hạn 50 cược mỗi lần

    if (betsError) {
      console.error("Error fetching pending bets:", betsError);
      throw new Error(`Lỗi khi lấy cược: ${betsError.message}`);
    }

    if (!pendingBets || pendingBets.length === 0) {
      return NextResponse.json({
        message: "Không có cược cần đối soát",
        processed: 0,
        won: 0,
        status: "NO_PENDING_BETS",
      });
    }

    console.log(`Đang xử lý ${pendingBets.length} cược...`);

    // 3. Chuẩn bị các dữ liệu cần thiết
    // Thu thập các ngày và province_id cần thiết
    const drawDates = [...new Set(pendingBets.map((bet) => bet.draw_date))];
    const provinceIds = [...new Set(pendingBets.map((bet) => bet.province_id))];
    const betTypeIds = [...new Set(pendingBets.map((bet) => bet.bet_type))];

    console.log(
      `Đối soát cho ${drawDates.length} ngày, ${provinceIds.length} tỉnh, ${betTypeIds.length} loại cược`
    );

    // 4. Lấy toàn bộ kết quả xổ số cần thiết
    console.log(`Lấy kết quả xổ số cho các ngày: ${drawDates.join(", ")}`);

    const resultsMap = {};
    for (const date of drawDates) {
      for (const provinceId of provinceIds) {
        const { data: results } = await supabase
          .from("results")
          .select("*")
          .eq("date", date)
          .eq("province_id", provinceId);

        if (results && results.length > 0) {
          if (!resultsMap[date]) resultsMap[date] = {};
          resultsMap[date][provinceId] = results[0];
        }
      }
    }

    // Kiểm tra xem có kết quả nào không
    const resultsFound = Object.keys(resultsMap).length > 0;
    if (!resultsFound) {
      return NextResponse.json({
        message: "Không tìm thấy kết quả xổ số cho các cược đang chờ",
        processed: 0,
        won: 0,
        status: "NO_RESULTS_FOUND",
        dates: drawDates,
        provinces: provinceIds,
      });
    }

    // 5. Lấy thông tin các loại cược
    console.log(`Lấy thông tin loại cược: ${betTypeIds.join(", ")}`);

    const { data: betTypes, error: betTypesError } = await supabase
      .from("rules")
      .select("*")
      .in("bet_type_id", betTypeIds);

    if (betTypesError) {
      console.error("Error fetching bet types:", betTypesError);
      throw new Error(
        `Lỗi khi lấy thông tin loại cược: ${betTypesError.message}`
      );
    }

    if (!betTypes || betTypes.length === 0) {
      return NextResponse.json({
        message: "Không tìm thấy thông tin loại cược",
        processed: 0,
        won: 0,
        status: "NO_BET_TYPES_FOUND",
      });
    }

    // Tạo map để tìm kiếm nhanh
    const betTypeMap = {};
    betTypes.forEach((bt) => {
      betTypeMap[bt.bet_type_id] = bt;
    });

    // 6. Đối soát từng cược
    console.log(`Bắt đầu đối soát ${pendingBets.length} cược...`);

    const processedBets = [];
    const wonBets = [];
    const lostBets = [];
    const errorBets = [];

    for (const bet of pendingBets) {
      console.log(
        `Đối soát cược ID: ${bet.id}, loại: ${bet.bet_type}, ngày: ${bet.draw_date}`
      );

      // Lấy kết quả xổ số tương ứng
      const result = resultsMap[bet.draw_date]?.[bet.province_id];

      if (!result) {
        console.log(
          `Không tìm thấy kết quả xổ số cho ${bet.province_id} ngày ${bet.draw_date}`
        );
        errorBets.push({
          id: bet.id,
          error: "NO_RESULT",
          details: { province_id: bet.province_id, draw_date: bet.draw_date },
        });
        continue;
      }

      // Lấy thông tin loại cược
      const betType = betTypeMap[bet.bet_type];

      if (!betType) {
        console.log(`Không tìm thấy thông tin loại cược ${bet.bet_type}`);
        errorBets.push({
          id: bet.id,
          error: "UNKNOWN_BET_TYPE",
          details: { bet_type: bet.bet_type },
        });
        continue;
      }

      // Đối soát kết quả
      try {
        const betResult = checkBetResultEnhanced(bet, result, betType);

        if (betResult.error) {
          console.log(`Lỗi khi đối soát: ${betResult.error}`);
          errorBets.push({
            id: bet.id,
            error: betResult.error,
            details: { bet_type: bet.bet_type, bet_variant: bet.bet_variant },
          });
          continue;
        }

        // Cập nhật trạng thái cược
        const status = betResult.isWinning ? "won" : "lost";
        const winAmount = betResult.winAmount;

        processedBets.push({
          id: bet.id,
          status,
          win_amount: winAmount,
        });

        if (status === "won") {
          console.log(`Cược ID ${bet.id} thắng ${winAmount}`);
          wonBets.push({
            id: bet.id,
            win_amount: winAmount,
            details: betResult.details,
          });
        } else {
          console.log(`Cược ID ${bet.id} thua`);
          lostBets.push({
            id: bet.id,
            details: betResult.details,
          });
        }
      } catch (error) {
        console.error(
          `Lỗi không xác định khi đối soát cược ID ${bet.id}:`,
          error
        );
        errorBets.push({
          id: bet.id,
          error: "UNEXPECTED_ERROR",
          details: { message: error.message },
        });
      }
    }

    // 7. Cập nhật các cược đã xử lý thành công
    console.log(`Cập nhật ${processedBets.length} cược vào database...`);

    let updatedCount = 0;
    for (const bet of processedBets) {
      const { error } = await supabase
        .from("bets")
        .update({
          status: bet.status,
          win_amount: bet.win_amount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);

      if (error) {
        console.error(`Error updating bet ${bet.id}:`, error);
        errorBets.push({
          id: bet.id,
          error: "UPDATE_ERROR",
          details: { message: error.message },
        });
      } else {
        updatedCount++;
      }
    }

    // 8. Tạo giao dịch cho các cược thắng
    console.log(`Tạo giao dịch cho ${wonBets.length} cược thắng...`);

    const transactions = [];
    for (const bet of wonBets) {
      const originalBet = pendingBets.find((b) => b.id === bet.id);

      if (originalBet) {
        transactions.push({
          user_id: originalBet.user_id,
          bet_id: bet.id,
          amount: bet.win_amount,
          type: "win",
          status: "completed",
          description: `Thắng cược ${originalBet.bet_type} ngày ${originalBet.draw_date}`,
        });
      }
    }

    if (transactions.length > 0) {
      const { error: transactionsError } = await supabase
        .from("transactions")
        .insert(transactions);

      if (transactionsError) {
        console.error("Error creating transactions:", transactionsError);
      } else {
        console.log(`Đã tạo ${transactions.length} giao dịch thắng cược`);

        // 9. Cập nhật số dư người dùng
        for (const transaction of transactions) {
          const { data: user } = await supabase
            .from("users")
            .select("balance")
            .eq("id", transaction.user_id)
            .single();

          if (user) {
            const newBalance = user.balance + transaction.amount;

            await supabase
              .from("users")
              .update({
                balance: newBalance,
                updated_at: new Date().toISOString(),
              })
              .eq("id", transaction.user_id);

            console.log(
              `Đã cập nhật số dư cho user ${transaction.user_id}: +${transaction.amount}`
            );
          }
        }
      }
    }

    // 10. Tổng kết kết quả
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: wonBets.length,
      lost: lostBets.length,
      errors: errorBets.length,
      updated: updatedCount,
      total_pending: totalPending,
      processing_time_ms: processingTime,
      error_details: errorBets.length > 0 ? errorBets : undefined,
    });
  } catch (error: any) {
    console.error("Error in enhanced processing:", error);
    return NextResponse.json(
      {
        error: "Lỗi hệ thống",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

// Tăng thời gian chạy tối đa cho API route
export const maxDuration = 60; // seconds
