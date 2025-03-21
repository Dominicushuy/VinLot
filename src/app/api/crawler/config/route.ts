// src/app/api/crawler/config/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    // Lấy cấu hình crawler từ database
    const { data, error } = await supabase
      .from("crawler_config")
      .select("*")
      .single();

    if (error) {
      // Nếu không có cấu hình, trả về cấu hình mặc định
      if (error.code === "PGRST116") {
        return NextResponse.json({
          enabled: true,
          schedule: {
            hour: 18,
            minute: 30,
          },
          regions: ["mien-bac", "mien-trung", "mien-nam"],
          retryCount: 3,
          delayBetweenRequests: 1000,
        });
      }

      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching crawler config:", error);
    return NextResponse.json(
      { error: "Failed to fetch crawler configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const config = await request.json();

    // Validate config
    if (!config || typeof config !== "object") {
      return NextResponse.json(
        { error: "Invalid configuration data" },
        { status: 400 }
      );
    }

    // Kiểm tra xem cấu hình đã tồn tại chưa
    const { data: existingConfig } = await supabase
      .from("crawler_config")
      .select("id")
      .single();

    let result;

    if (existingConfig) {
      // Update existing config
      const { data, error } = await supabase
        .from("crawler_config")
        .update({
          enabled: config.enabled,
          schedule: config.schedule,
          regions: config.regions,
          retry_count: config.retryCount,
          delay_between_requests: config.delayBetweenRequests,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new config
      const { data, error } = await supabase
        .from("crawler_config")
        .insert({
          enabled: config.enabled,
          schedule: config.schedule,
          regions: config.regions,
          retry_count: config.retryCount,
          delay_between_requests: config.delayBetweenRequests,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Format the response to match our expected structure
    return NextResponse.json({
      enabled: result.enabled,
      schedule: result.schedule,
      regions: result.regions,
      retryCount: result.retry_count,
      delayBetweenRequests: result.delay_between_requests,
    });
  } catch (error) {
    console.error("Error saving crawler config:", error);
    return NextResponse.json(
      { error: "Failed to save crawler configuration" },
      { status: 500 }
    );
  }
}
