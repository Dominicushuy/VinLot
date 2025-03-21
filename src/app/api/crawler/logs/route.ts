// src/app/api/crawler/logs/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("crawler_logs")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (region) {
      query = query.eq("region", region);
    }

    if (search) {
      query = query.ilike("date", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match our frontend structure
    const transformedData = data.map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      type: item.type,
      region: item.region,
      status: item.status,
      resultCount: item.result_count,
      error: item.error,
      duration: item.duration,
      // Không trả về trường result đầy đủ để giảm kích thước response
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching crawler logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch crawler logs" },
      { status: 500 }
    );
  }
}
