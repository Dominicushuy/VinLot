// src/app/api/admin/pending-bets/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // 1. Lấy danh sách các cược pending
    const {
      data: bets,
      error,
      count,
    } = await supabase
      .from("bets")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("draw_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching pending bets:", error);
      return NextResponse.json(
        { error: "Failed to fetch pending bets" },
        { status: 500 }
      );
    }

    // 2. Lấy thông tin provinces
    const provinceIds = [...new Set(bets.map((bet) => bet.province_id))];
    const { data: provinces } = await supabase
      .from("provinces")
      .select("province_id, name")
      .in("province_id", provinceIds);

    // Tạo map để dễ dàng lookup
    const provinceMap = {};
    if (provinces) {
      provinces.forEach((province) => {
        provinceMap[province.province_id] = province.name;
      });
    }

    // 3. Lấy thông tin bet types
    const betTypeIds = [...new Set(bets.map((bet) => bet.bet_type))];
    const { data: betTypes } = await supabase
      .from("rules")
      .select("bet_type_id, name")
      .in("bet_type_id", betTypeIds);

    // Tạo map để dễ dàng lookup
    const betTypeMap = {};
    if (betTypes) {
      betTypes.forEach((type) => {
        betTypeMap[type.bet_type_id] = type.name;
      });
    }

    // 4. Kết hợp dữ liệu
    const transformedBets = bets.map((bet) => ({
      id: bet.id,
      bet_date: bet.bet_date,
      draw_date: bet.draw_date,
      province_id: bet.province_id,
      province_name: provinceMap[bet.province_id] || bet.province_id,
      bet_type: bet.bet_type,
      bet_type_name: betTypeMap[bet.bet_type] || bet.bet_type,
      numbers: bet.numbers,
      total_amount: bet.total_amount,
    }));

    // Check if there are more items
    const hasMore = count ? offset + pageSize < count : false;

    return NextResponse.json({
      bets: transformedBets,
      hasMore,
      total: count || 0,
    });
  } catch (error: any) {
    console.error("Error in pending-bets API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
