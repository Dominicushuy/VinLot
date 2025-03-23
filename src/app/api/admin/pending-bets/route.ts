// src/app/api/admin/pending-bets/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Định nghĩa interface cho đối tượng Province
interface Province {
  province_id: string;
  name: string;
}

// Định nghĩa interface cho đối tượng BetType
interface BetType {
  bet_type_id: string;
  name: string;
}

// Định nghĩa interface cho đối tượng Bet được trả về
interface TransformedBet {
  id: string;
  bet_date: string;
  draw_date: string;
  province_id: string;
  province_name: string;
  bet_type: string;
  bet_type_name: string;
  numbers: string[];
  total_amount: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const betType = searchParams.get("betType");
    const provinceId = searchParams.get("provinceId");

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    console.log(
      `Fetching pending bets with page=${page}, pageSize=${pageSize}, offset=${offset}, search=${search}, fromDate=${fromDate}, toDate=${toDate}, betType=${betType}, provinceId=${provinceId}`
    );

    // 1. Lấy danh sách các cược pending
    let query = supabase
      .from("bets")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("draw_date", { ascending: false });

    // Thêm các bộ lọc
    if (search) {
      // Tìm kiếm số cược hoặc tỉnh
      query = query.or(`numbers.cs.{${search}},province_id.ilike.%${search}%`);
    }

    if (fromDate) {
      query = query.gte("draw_date", fromDate);
    }

    if (toDate) {
      query = query.lte("draw_date", toDate);
    }

    if (betType && betType !== "all") {
      query = query.eq("bet_type", betType);
    }

    if (provinceId && provinceId !== "all") {
      query = query.eq("province_id", provinceId);
    }

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
    let provinces: Province[] = [];
    if (provinceIds.length > 0) {
      const { data: provincesData } = await supabase
        .from("provinces")
        .select("province_id, name")
        .in("province_id", provinceIds);

      provinces = provincesData || [];
    }

    // Tạo map để dễ dàng lookup
    const provinceMap: Record<string, string> = {};
    if (provinces.length > 0) {
      provinces.forEach((province) => {
        provinceMap[province.province_id] = province.name;
      });
    }

    // 3. Lấy thông tin bet types
    const betTypeIds = [...new Set(bets.map((bet) => bet.bet_type))];

    // Trường hợp không có betTypeIds nào, tránh lỗi IN với mảng rỗng
    let betTypes: BetType[] = [];
    if (betTypeIds.length > 0) {
      const { data: betTypesData } = await supabase
        .from("rules")
        .select("bet_type_id, name")
        .in("bet_type_id", betTypeIds);

      betTypes = betTypesData || [];
    }

    // Tạo map để dễ dàng lookup
    const betTypeMap: Record<string, string> = {};
    if (betTypes.length > 0) {
      betTypes.forEach((type) => {
        betTypeMap[type.bet_type_id] = type.name;
      });
    }

    // 4. Kết hợp dữ liệu
    const transformedBets: TransformedBet[] = bets.map((bet) => ({
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
    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return NextResponse.json({
      bets: transformedBets,
      hasMore,
      total: count || 0,
      totalPages,
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Error in pending-bets API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
