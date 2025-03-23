// src/app/api/admin/process-stats/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { format, startOfDay, startOfMonth } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const todayStr = format(startOfDay(today), "yyyy-MM-dd");
    const startOfMonthStr = format(startOfMonth(today), "yyyy-MM-dd");

    // 1. Lấy số lượng cược đang chờ đối soát
    const { count: pendingCount, error: pendingError } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (pendingError) {
      console.error("Error fetching pending bets count:", pendingError);
    }

    // 2. Lấy số lượng cược đã đối soát trong ngày hôm nay
    const { count: processedToday, error: todayError } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .neq("status", "pending")
      .gte("updated_at", `${todayStr}T00:00:00`)
      .lte("updated_at", `${todayStr}T23:59:59`);

    if (todayError) {
      console.error("Error fetching today processed bets:", todayError);
    }

    // 3. Lấy số lượng cược đã đối soát trong tháng
    const { count: processedThisMonth, error: monthError } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .neq("status", "pending")
      .gte("updated_at", `${startOfMonthStr}T00:00:00`);

    if (monthError) {
      console.error("Error fetching monthly processed bets:", monthError);
    }

    // 4. Lấy số lượng cược thắng trong tháng
    const { count: wonThisMonth, error: wonError } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("status", "won")
      .gte("updated_at", `${startOfMonthStr}T00:00:00`);

    if (wonError) {
      console.error("Error fetching monthly won bets:", wonError);
    }

    // 5. Lấy số lượng cược thua trong tháng
    const { count: lostThisMonth, error: lostError } = await supabase
      .from("bets")
      .select("*", { count: "exact", head: true })
      .eq("status", "lost")
      .gte("updated_at", `${startOfMonthStr}T00:00:00`);

    if (lostError) {
      console.error("Error fetching monthly lost bets:", lostError);
    }

    // 6. Lấy tổng tiền thắng trong tháng
    const { data: monthWinnings, error: winningsError } = await supabase
      .from("bets")
      .select("win_amount")
      .eq("status", "won")
      .gte("updated_at", `${startOfMonthStr}T00:00:00`);

    let totalWinAmount = 0;
    if (monthWinnings) {
      totalWinAmount = monthWinnings.reduce(
        (sum, bet) => sum + (bet.win_amount || 0),
        0
      );
    }

    if (winningsError) {
      console.error("Error fetching monthly win amount:", winningsError);
    }

    // 7. Trả về kết quả
    return NextResponse.json({
      pendingCount: pendingCount || 0,
      processedToday: processedToday || 0,
      processedThisMonth: processedThisMonth || 0,
      wonThisMonth: wonThisMonth || 0,
      lostThisMonth: lostThisMonth || 0,
      totalWinAmount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching process stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
