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

    console.log(
      `Fetching pending bets with page=${page}, pageSize=${pageSize}, offset=${offset}`
    );

    // 1. Lấy danh sách các cược pending
    let query = supabase
      .from("bets")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("draw_date", { ascending: false });

    // Thêm phân trang
    query = query.range(offset, offset + pageSize - 1);

    const { data: bets, error, count } = await query;

    if (error) {
      console.error("Error fetching pending bets:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      `Found ${count || 0} pending bets, returning ${bets?.length || 0} items`
    );

    // Nếu không có bets, trả về mảng rỗng để tránh lỗi
    if (!bets || bets.length === 0) {
      return NextResponse.json({
        bets: [],
        hasMore: false,
        total: count || 0,
      });
    }

    // 2. Lấy thông tin provinces
    const provinceIds = [...new Set(bets.map((bet) => bet.province_id))];

    // Trường hợp không có provinceIds nào, tránh lỗi IN với mảng rỗng
    let provinces = [];
    if (provinceIds.length > 0) {
      const { data: provincesData } = await supabase
        .from("provinces")
        .select("province_id, name")
        .in("province_id", provinceIds);

      provinces = provincesData || [];
    }

    // Tạo map để dễ dàng lookup
    const provinceMap = {};
    if (provinces.length > 0) {
      provinces.forEach((province) => {
        provinceMap[province.province_id] = province.name;
      });
    }

    // 3. Lấy thông tin bet types
    const betTypeIds = [...new Set(bets.map((bet) => bet.bet_type))];

    // Trường hợp không có betTypeIds nào, tránh lỗi IN với mảng rỗng
    let betTypes = [];
    if (betTypeIds.length > 0) {
      const { data: betTypesData } = await supabase
        .from("rules")
        .select("bet_type_id, name")
        .in("bet_type_id", betTypeIds);

      betTypes = betTypesData || [];
    }

    // Tạo map để dễ dàng lookup
    const betTypeMap = {};
    if (betTypes.length > 0) {
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
      numbers: bet.numbers || [],
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
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
