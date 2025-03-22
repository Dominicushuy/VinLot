import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { checkBetResult } from "@/lib/utils/bet-result-processor";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const betId = params.id;

    if (!betId) {
      return NextResponse.json(
        { error: "ID phiếu cược là bắt buộc" },
        { status: 400 }
      );
    }

    // 1. Lấy thông tin phiếu cược
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .select("*")
      .eq("id", betId)
      .single();

    if (betError) {
      return NextResponse.json(
        { error: "Không tìm thấy phiếu cược" },
        { status: 404 }
      );
    }

    // 2. Nếu phiếu đã được đối soát, trả về kết quả luôn
    if (bet.status !== "pending") {
      return NextResponse.json({
        id: bet.id,
        status: bet.status,
        win_amount: bet.win_amount || 0,
        already_processed: true,
      });
    }

    // 3. Lấy kết quả xổ số cho ngày này
    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .eq("date", bet.draw_date)
      .eq("province_id", bet.province_id);

    if (resultsError) {
      return NextResponse.json(
        { error: "Lỗi khi lấy kết quả xổ số" },
        { status: 500 }
      );
    }

    // 4. Nếu chưa có kết quả xổ số, trả về trạng thái đang chờ
    if (!results || results.length === 0) {
      return NextResponse.json({
        id: bet.id,
        status: "pending",
        message: "Chưa có kết quả xổ số cho ngày này",
      });
    }

    // 5. Lấy thông tin loại cược
    const { data: betType, error: betTypeError } = await supabase
      .from("rules")
      .select("*")
      .eq("bet_type_id", bet.bet_type)
      .single();

    if (betTypeError) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin loại cược" },
        { status: 500 }
      );
    }

    // 6. Đối soát kết quả
    const winAmount = checkBetResult(bet, results[0], betType);
    const status = winAmount > 0 ? "won" : "lost";

    // 7. Cập nhật phiếu cược và tạo giao dịch nếu win
    if (status === "won") {
      // Cập nhật phiếu
      await supabase
        .from("bets")
        .update({
          status,
          win_amount: winAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);

      // Tạo giao dịch
      await supabase.from("transactions").insert({
        user_id: bet.user_id,
        bet_id: bet.id,
        amount: winAmount,
        type: "win",
        status: "completed",
        description: `Thắng cược ${bet.bet_type} ngày ${bet.draw_date}`,
      });

      // Cập nhật số dư người dùng
      const { data: user } = await supabase
        .from("users")
        .select("balance")
        .eq("id", bet.user_id)
        .single();

      if (user) {
        await supabase
          .from("users")
          .update({
            balance: user.balance + winAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bet.user_id);
      }
    } else {
      // Cập nhật phiếu thua
      await supabase
        .from("bets")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bet.id);
    }

    // 8. Trả về kết quả kiểm tra
    return NextResponse.json({
      id: bet.id,
      status: status,
      win_amount: winAmount,
      newly_processed: true,
    });
  } catch (error: any) {
    console.error("Error checking bet:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
