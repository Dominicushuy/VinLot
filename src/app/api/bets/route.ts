// src/app/api/bets/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { betFormSchema } from "@/lib/validators/bet-form-validator";
import { calculateBetAmount, calculatePotentialWinAmount } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    // Lấy dữ liệu từ request
    const data = await request.json();

    // Validate dữ liệu
    const validationResult = betFormSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      betDate,
      drawDate,
      regionType,
      provinces,
      betType,
      betVariant,
      numbers,
      selectionMethod,
      denomination,
      userId,
    } = validationResult.data;

    console.log("Received bet data:", validationResult.data);

    // Kiểm tra user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, balance")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    // Lấy thông tin loại cược
    const { data: betTypeData, error: betTypeError } = await supabase
      .from("rules")
      .select("*")
      .eq("bet_type_id", betType)
      .single();

    if (betTypeError || !betTypeData) {
      return NextResponse.json(
        { error: "Không tìm thấy loại cược" },
        { status: 404 }
      );
    }

    // Parse dữ liệu JSONB
    const regionRules =
      typeof betTypeData.region_rules === "string"
        ? JSON.parse(betTypeData.region_rules)
        : betTypeData.region_rules;

    const winningRatio =
      typeof betTypeData.winning_ratio === "string"
        ? JSON.parse(betTypeData.winning_ratio)
        : betTypeData.winning_ratio;

    const variants =
      typeof betTypeData.variants === "string"
        ? JSON.parse(betTypeData.variants)
        : betTypeData.variants;

    // Tạo cấu trúc dữ liệu cho utils functions
    const lotteryData = {
      betTypes: [
        {
          id: betType,
          name: betTypeData.name,
          description: betTypeData.description,
          digitCount: betTypeData.digit_count,
          variants: variants,
          regions: [
            {
              id: regionType,
              name: regionType === "M1" ? "Miền Nam/Trung" : "Miền Bắc",
              betMultipliers: regionRules[regionType].betMultipliers,
              combinationCount: regionRules[regionType].combinationCount,
              winningRules: regionRules[regionType].winningRules,
            },
          ],
          winningRatio: winningRatio,
        },
      ],
    };

    // Tính tổng tiền đặt và tiềm năng thắng
    let totalAmount = 0;
    const bets = [];

    for (const provinceId of provinces) {
      // Tính tiền cược cho một tỉnh
      const betAmount = calculateBetAmount(
        betType,
        betVariant,
        regionType,
        denomination,
        numbers.length,
        lotteryData
      );

      // Tính tiềm năng thắng
      const potentialWinAmount =
        calculatePotentialWinAmount(
          betType,
          betVariant,
          denomination,
          lotteryData
        ) * numbers.length;

      totalAmount += betAmount;

      // Chuẩn bị dữ liệu cho bảng bets
      bets.push({
        user_id: userId,
        bet_date: new Date(betDate).toISOString().split("T")[0],
        draw_date: new Date(drawDate).toISOString().split("T")[0],
        region_type: regionType,
        province_id: provinceId,
        bet_type: betType,
        bet_variant: betVariant,
        numbers,
        selection_method: selectionMethod,
        denomination,
        total_amount: betAmount,
        potential_win_amount: potentialWinAmount,
        status: "pending",
      });
    }

    // Kiểm tra số dư
    if (user.balance < totalAmount) {
      return NextResponse.json({ error: "Số dư không đủ" }, { status: 400 });
    }

    // Lưu các cược vào database
    const { data: betsData, error: betsError } = await supabase
      .from("bets")
      .insert(bets)
      .select();

    if (betsError) {
      return NextResponse.json(
        { error: "Lỗi khi lưu cược", details: betsError.message },
        { status: 500 }
      );
    }

    // Tạo giao dịch
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        bet_id: betsData[0].id,
        amount: totalAmount,
        type: "bet",
        status: "completed",
        description: `Đặt cược ${betType} ${numbers.length} số cho ${provinces.length} đài`,
      });

    if (transactionError) {
      return NextResponse.json(
        { error: "Lỗi khi tạo giao dịch", details: transactionError.message },
        { status: 500 }
      );
    }

    // Cập nhật số dư người dùng
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ balance: user.balance - totalAmount })
      .eq("id", userId);

    if (updateUserError) {
      return NextResponse.json(
        { error: "Lỗi khi cập nhật số dư", details: updateUserError.message },
        { status: 500 }
      );
    }

    // Trả về kết quả
    return NextResponse.json({
      success: true,
      bets: betsData,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error placing bet:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống", details: error.message },
      { status: 500 }
    );
  }
}
