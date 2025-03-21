// src/app/api/crawler/run/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { runCrawler } from "@/lib/services/crawler-runner";
import { saveResultsToDatabase } from "@/lib/utils/result-saver";

export async function POST(request: Request) {
  try {
    const { date, regions } = await request.json();

    // Validate required fields
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    if (!regions || !Array.isArray(regions) || regions.length === 0) {
      return NextResponse.json(
        { error: "At least one region must be selected" },
        { status: 400 }
      );
    }

    // Chạy crawler cho mỗi miền được chọn
    const results = [];
    const logEntries = [];

    const startTime = Date.now();

    for (const region of regions) {
      try {
        // Chạy crawler và lấy kết quả
        const result = await runCrawler({
          date,
          region,
          retryCount: 3,
          delayBetweenRequests: 1000,
        });

        results.push({
          region,
          status: "success",
          data: result,
        });

        // Tạo log entry
        logEntries.push({
          date,
          time: new Date().toISOString().split("T")[1].substring(0, 8),
          type: "manual",
          region,
          status: "success",
          result_count: result?.duLieu ? Object.keys(result.duLieu).length : 0,
          result,
          duration: Date.now() - startTime,
        });
      } catch (error: any) {
        results.push({
          region,
          status: "error",
          error: error.message,
        });

        // Tạo log entry lỗi
        logEntries.push({
          date,
          time: new Date().toISOString().split("T")[1].substring(0, 8),
          type: "manual",
          region,
          status: "error",
          error: error.message,
          duration: Date.now() - startTime,
        });
      }
    }

    // Lưu logs vào database
    if (logEntries.length > 0) {
      const { error } = await supabase.from("crawler_logs").insert(logEntries);

      if (error) {
        console.error("Error saving crawler logs:", error);
      }
    }

    // Lưu kết quả vào bảng results nếu thành công
    const successResults = results.filter((r) => r.status === "success");
    if (successResults.length > 0) {
      // Sử dụng utility function để lưu kết quả
      await saveResultsToDatabase(successResults);
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Error running crawler:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run crawler" },
      { status: 500 }
    );
  }
}
