"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { useRunCrawler } from "@/lib/hooks/use-crawler";
import { format } from "date-fns";

// Schema validation cho form crawl thủ công
const manualCrawlSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày lấy kết quả",
  }),
  regions: z
    .array(z.enum(["mien-bac", "mien-trung", "mien-nam"]))
    .min(1, "Vui lòng chọn ít nhất 1 miền"),
});

type ManualCrawlFormValues = z.infer<typeof manualCrawlSchema>;

export function ManualCrawler() {
  const runCrawler = useRunCrawler();
  const [regions, setRegions] = useState<string[]>([
    "mien-bac",
    "mien-trung",
    "mien-nam",
  ]);
  const [crawlingStatus, setCrawlingStatus] = useState<{
    status: "idle" | "running" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const form = useForm<ManualCrawlFormValues>({
    resolver: zodResolver(manualCrawlSchema),
    defaultValues: {
      date: new Date(),
      regions: ["mien-bac", "mien-trung", "mien-nam"],
    },
  });

  const toggleRegion = (region: string) => {
    if (regions.includes(region)) {
      const newRegions = regions.filter((r) => r !== region);
      setRegions(newRegions);
      form.setValue("regions", newRegions as any);
    } else {
      const newRegions = [...regions, region];
      setRegions(newRegions);
      form.setValue("regions", newRegions as any);
    }
  };

  const onSubmit = async (data: ManualCrawlFormValues) => {
    try {
      setCrawlingStatus({ status: "running" });
      await runCrawler.mutateAsync({
        date: format(data.date, "yyyy-MM-dd"),
        regions: data.regions,
      });

      setCrawlingStatus({
        status: "success",
        message: `Đã lấy thành công kết quả cho ngày ${formatDate(data.date)}`,
      });

      toast({
        title: "Thành công",
        description: `Đã lấy kết quả xổ số ngày ${formatDate(data.date)}`,
      });
    } catch (error) {
      console.error("Error running crawler", error);
      setCrawlingStatus({
        status: "error",
        message: "Đã xảy ra lỗi khi lấy kết quả. Vui lòng thử lại!",
      });

      toast({
        title: "Lỗi",
        description: "Không thể lấy kết quả xổ số. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Lấy kết quả xổ số thủ công</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Ngày cần lấy kết quả</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date") ? (
                      formatDate(form.watch("date"))
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) =>
                      form.setValue("date", date || new Date())
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Miền lấy kết quả</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={regions.includes("mien-bac") ? "lottery" : "outline"}
                  onClick={() => toggleRegion("mien-bac")}
                >
                  Miền Bắc
                </Button>
                <Button
                  type="button"
                  variant={
                    regions.includes("mien-trung") ? "lottery" : "outline"
                  }
                  onClick={() => toggleRegion("mien-trung")}
                >
                  Miền Trung
                </Button>
                <Button
                  type="button"
                  variant={regions.includes("mien-nam") ? "lottery" : "outline"}
                  onClick={() => toggleRegion("mien-nam")}
                >
                  Miền Nam
                </Button>
              </div>
              {form.formState.errors.regions && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.regions.message}
                </p>
              )}
            </div>
          </div>

          {/* Trạng thái crawling */}
          {crawlingStatus.status !== "idle" && (
            <div
              className={cn(
                "p-4 rounded-md",
                crawlingStatus.status === "running" &&
                  "bg-blue-50 border border-blue-200",
                crawlingStatus.status === "success" &&
                  "bg-green-50 border border-green-200",
                crawlingStatus.status === "error" &&
                  "bg-red-50 border border-red-200"
              )}
            >
              <div className="flex items-center">
                {crawlingStatus.status === "running" && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                )}
                {crawlingStatus.status === "success" && (
                  <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                )}
                {crawlingStatus.status === "error" && (
                  <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                )}
                <p
                  className={cn(
                    crawlingStatus.status === "running" && "text-blue-700",
                    crawlingStatus.status === "success" && "text-green-700",
                    crawlingStatus.status === "error" && "text-red-700"
                  )}
                >
                  {crawlingStatus.status === "running" &&
                    "Đang lấy kết quả xổ số..."}
                  {crawlingStatus.status === "success" &&
                    crawlingStatus.message}
                  {crawlingStatus.status === "error" && crawlingStatus.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              variant="lottery"
              disabled={
                runCrawler.isPending || crawlingStatus.status === "running"
              }
            >
              {runCrawler.isPending || crawlingStatus.status === "running"
                ? "Đang xử lý..."
                : "Lấy kết quả ngay"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
