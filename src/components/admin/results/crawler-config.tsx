"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  useCrawlerConfig,
  useSaveCrawlerConfig,
} from "@/lib/hooks/use-crawler";

// Schema validation cho cấu hình crawler
const crawlerConfigSchema = z.object({
  enabled: z.boolean().default(true),
  schedule: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }),
  regions: z
    .array(z.enum(["mien-bac", "mien-trung", "mien-nam"]))
    .min(1, "Vui lòng chọn ít nhất 1 miền"),
  retryCount: z.number().min(1).max(10),
  delayBetweenRequests: z.number().min(500).max(10000),
});

type CrawlerConfigFormValues = z.infer<typeof crawlerConfigSchema>;

export function CrawlerConfig() {
  const { data: config, isLoading } = useCrawlerConfig();
  const saveConfig = useSaveCrawlerConfig();
  const [regions, setRegions] = useState<string[]>([
    "mien-bac",
    "mien-trung",
    "mien-nam",
  ]);

  const form = useForm<CrawlerConfigFormValues>({
    resolver: zodResolver(crawlerConfigSchema),
    defaultValues: {
      enabled: true,
      schedule: {
        hour: 18,
        minute: 30,
      },
      regions: ["mien-bac", "mien-trung", "mien-nam"],
      retryCount: 3,
      delayBetweenRequests: 1000,
    },
  });

  // Cập nhật form khi có dữ liệu config - Mover esto a useEffect
  useEffect(() => {
    if (config && !isLoading) {
      form.reset({
        enabled: config.enabled,
        schedule: config.schedule,
        regions: config.regions,
        retryCount: config.retryCount,
        delayBetweenRequests: config.delayBetweenRequests,
      });
      setRegions(config.regions);
    }
  }, [config, isLoading, form]);

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

  const onSubmit = async (data: CrawlerConfigFormValues) => {
    try {
      await saveConfig.mutateAsync(data);
      toast({
        title: "Thành công",
        description: "Đã lưu cấu hình crawler",
      });
    } catch (error) {
      console.error("Error saving crawler config", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình tự động lấy kết quả xổ số</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={form.watch("enabled")}
              onCheckedChange={(value) => form.setValue("enabled", value)}
            />
            <Label htmlFor="enabled">Kích hoạt tự động crawl</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Lịch crawl hàng ngày</Label>
              <div className="flex space-x-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="hour">Giờ</Label>
                  <Select
                    value={form.watch("schedule.hour").toString()}
                    onValueChange={(value) =>
                      form.setValue("schedule.hour", parseInt(value))
                    }
                  >
                    <SelectTrigger id="hour">
                      <SelectValue placeholder="Giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="minute">Phút</Label>
                  <Select
                    value={form.watch("schedule.minute").toString()}
                    onValueChange={(value) =>
                      form.setValue("schedule.minute", parseInt(value))
                    }
                  >
                    <SelectTrigger id="minute">
                      <SelectValue placeholder="Phút" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60, step: 5 }, (_, i) => i).map(
                        (minute) => (
                          <SelectItem key={minute} value={minute.toString()}>
                            {minute.toString().padStart(2, "0")}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Crawler sẽ chạy vào thời điểm này hàng ngày để lấy kết quả mới
                nhất
              </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="retryCount">Số lần thử lại (nếu lỗi)</Label>
              <Input
                id="retryCount"
                type="number"
                min="1"
                max="10"
                {...form.register("retryCount", { valueAsNumber: true })}
              />
              {form.formState.errors.retryCount && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.retryCount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="delayBetweenRequests">
                Độ trễ giữa các request (ms)
              </Label>
              <Input
                id="delayBetweenRequests"
                type="number"
                min="500"
                max="10000"
                step="100"
                {...form.register("delayBetweenRequests", {
                  valueAsNumber: true,
                })}
              />
              {form.formState.errors.delayBetweenRequests && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.delayBetweenRequests.message}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Thời gian chờ giữa các request, giúp tránh bị block
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              variant="lottery"
              disabled={saveConfig.isPending}
            >
              {saveConfig.isPending ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
