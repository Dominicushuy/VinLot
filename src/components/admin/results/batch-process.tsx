"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

// Schema cho form đối soát
const processFormSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

type ProcessFormValues = z.infer<typeof processFormSchema>;

export function BatchProcessResults() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBets, setPendingBets] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loadingStats, setLoadingStats] = useState(false);

  // Form với validation
  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processFormSchema),
    defaultValues: {
      dateRange: {
        from: subDays(new Date(), 7),
        to: new Date(),
      },
    },
  });

  // Đếm số lượng cược cần đối soát
  const fetchPendingBets = async () => {
    try {
      setLoadingStats(true);
      const dateRange = form.getValues().dateRange;

      if (!dateRange.from || !dateRange.to) {
        return;
      }

      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = format(dateRange.to, "yyyy-MM-dd");

      // Gọi API để lấy số lượng cược pending
      const response = await fetch(
        `/api/admin/bets/count?status=pending&fromDate=${fromDate}&toDate=${toDate}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy thông tin cược");
      }

      const data = await response.json();
      setPendingBets(data.count || 0);
    } catch (error) {
      console.error("Error fetching pending bets:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy số lượng cược cần đối soát",
        variant: "destructive",
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Xử lý khi submit form
  const onSubmit = () => {
    fetchPendingBets();
  };

  // Xử lý đối soát theo ngày cụ thể
  const processSpecificDate = (date: string) => {
    setSelectedDate(date);
    setConfirmOpen(true);
  };

  // Xử lý xác nhận đối soát
  const handleConfirmProcess = async () => {
    try {
      setIsProcessing(true);
      setConfirmOpen(false);

      // Gọi API để đối soát
      const response = await fetch("/api/admin/process-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: selectedDate }),
      });

      if (!response.ok) {
        throw new Error("Đối soát thất bại");
      }

      const data = await response.json();
      setResults(data);

      toast({
        title: "Đối soát thành công",
        description: `Đã xử lý ${data.processed} cược, ${data.won} cược thắng.`,
      });

      // Cập nhật lại số lượng cược cần đối soát
      fetchPendingBets();
    } catch (error) {
      console.error("Error processing bets:", error);
      toast({
        title: "Lỗi",
        description: "Đối soát thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = (value: any) => {
    form.setValue("dateRange", value);
    setPendingBets(0);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đối soát kết quả hàng loạt</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Khoảng thời gian</label>
                <DateRangePicker
                  value={form.watch("dateRange")}
                  onChange={handleDateRangeChange}
                />
              </div>

              <div className="flex items-end space-x-2">
                <Button type="submit" variant="lottery" className="flex-1">
                  Tìm kiếm cược cần đối soát
                </Button>
              </div>
            </div>
          </form>

          {loadingStats ? (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : pendingBets > 0 ? (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-blue-700">
                    Có {pendingBets} cược cần đối soát
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Trong khoảng từ{" "}
                    {form.watch("dateRange").from
                      ? format(form.watch("dateRange").from, "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : ""}{" "}
                    đến{" "}
                    {form.watch("dateRange").to
                      ? format(form.watch("dateRange").to, "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Danh sách ngày đối soát */}
      {pendingBets > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Đối soát theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Chọn một ngày cụ thể để đối soát tất cả các cược của ngày đó:
              </p>

              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = subDays(new Date(), index);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const formattedDate = format(date, "dd/MM/yyyy", {
                    locale: vi,
                  });
                  const dayOfWeek = format(date, "EEEE", { locale: vi });

                  return (
                    <div
                      key={dateStr}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{formattedDate}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {dayOfWeek}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => processSpecificDate(dateStr)}
                      >
                        Đối soát
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kết quả đối soát */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả đối soát</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-medium text-green-700">
                    Đã đối soát {results.processed} cược
                  </h3>
                  <p className="text-sm text-green-600 mt-1">
                    {results.won} cược thắng, {results.processed - results.won}{" "}
                    cược thua
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <Badge variant="outline" className="bg-white">
                    Ngày: {selectedDate}
                  </Badge>
                </div>
              </div>

              {results.details && results.details.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">Tất cả</TabsTrigger>
                      <TabsTrigger value="won">Thắng</TabsTrigger>
                      <TabsTrigger value="lost">Thua</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog xác nhận đối soát */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đối soát</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đối soát tất cả các cược của ngày{" "}
              {selectedDate
                ? format(new Date(selectedDate), "dd/MM/yyyy", { locale: vi })
                : ""}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="lottery"
              onClick={handleConfirmProcess}
              disabled={isProcessing}
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận đối soát"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
