// src/app/api/crawler/logs/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("crawler_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    // Transform to match our frontend structure
    const transformedData = {
      id: data.id,
      date: data.date,
      time: data.time,
      type: data.type,
      region: data.region,
      status: data.status,
      resultCount: data.result_count,
      error: data.error,
      duration: data.duration,
      result: data.result,
      created_at: data.created_at,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching crawler log detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch crawler log detail" },
      { status: 500 }
    );
  }
}
