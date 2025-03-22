import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const betType = searchParams.get("betType");
    const provinceId = searchParams.get("provinceId");

    let query = supabase.from("bets").select("id", { count: "exact" });

    // Áp dụng các bộ lọc
    if (status) {
      query = query.eq("status", status);
    }

    if (fromDate) {
      query = query.gte("draw_date", fromDate);
    }

    if (toDate) {
      query = query.lte("draw_date", toDate);
    }

    if (betType) {
      query = query.eq("bet_type", betType);
    }

    if (provinceId) {
      query = query.eq("province_id", provinceId);
    }

    const { count, error } = await query;

    if (error) {
      console.error("Error counting bets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    console.error("Error in count API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
