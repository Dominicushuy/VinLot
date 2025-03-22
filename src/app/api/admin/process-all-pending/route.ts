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
    console.log("Ngày cần lấy kết quả:", drawDates);

    let allResults = [];
    for (const date of drawDates) {
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select("*")
        .eq("date", date);

      if (resultsError) {
        console.error(`Error fetching results for date ${date}:`, resultsError);
        continue; // Bỏ qua lỗi và tiếp tục với ngày khác
      }

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
        status: "no_results",
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

    if (!betTypes || betTypes.length === 0) {
      return NextResponse.json({
        message: "Không tìm thấy thông tin loại cược",
        processed: 0,
        won: 0,
        status: "no_bet_types",
      });
    }

    // 4. Đối soát từng cược
    const processedBets = [];
    const transactions = [];

    for (const bet of pendingBets) {
      console.log(
        `Processing bet ID: ${bet.id}, type: ${bet.bet_type}, province: ${bet.province_id}, draw date: ${bet.draw_date}`
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
        // Parse JSONB fields từ database nếu cần
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

        const winAmount = checkBetResult(
          bet,
          provinceResults[0],
          betTypeWithParsedFields
        );
        console.log(`Bet ${bet.id} result: win amount = ${winAmount}`);

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
    const updatePromises = processedBets.map(async (bet) => {
      try {
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
          return false;
        }
        return true;
      } catch (error) {
        console.error(`Error in update promise for bet ${bet.id}:`, error);
        return false;
      }
    });

    // Chờ tất cả các update hoàn thành
    const updateResults = await Promise.all(updatePromises);
    const successfulUpdates = updateResults.filter((result) => result).length;

    console.log(`Updated ${successfulUpdates} bets in database`);

    // 6. Tạo giao dịch cho các cược thắng
    if (transactions.length > 0) {
      try {
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert(transactions);

        if (transactionError) {
          console.error("Error creating transactions:", transactionError);
        } else {
          console.log(`Created ${transactions.length} transactions`);

          // 7. Cập nhật số dư người dùng
          for (const transaction of transactions) {
            try {
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
                const newBalance = user.balance + transaction.amount;
                const { error: updateUserError } = await supabase
                  .from("users")
                  .update({
                    balance: newBalance,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", transaction.user_id);

                if (updateUserError) {
                  console.error(
                    `Error updating user balance ${transaction.user_id}:`,
                    updateUserError
                  );
                } else {
                  console.log(
                    `Updated user ${transaction.user_id} balance to ${newBalance}`
                  );
                }
              }
            } catch (error) {
              console.error(
                `Error updating user balance for transaction:`,
                error
              );
            }
          }
        }
      } catch (error) {
        console.error("Error in transactions handling:", error);
      }
    }

    // Trả về kết quả đối soát
    return NextResponse.json({
      success: true,
      processed: processedBets.length,
      won: transactions.length,
      total: count || pendingBets.length,
      updated: successfulUpdates,
    });
  } catch (error: any) {
    console.error("Error processing all pending bets:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}

// Tăng timeout API route nếu cần
export const maxDuration = 60; // 60 seconds
