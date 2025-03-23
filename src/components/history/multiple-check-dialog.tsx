// src/components/history/multiple-check-dialog.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Info, ExternalLink, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Schema cho form
const checkFormSchema = z.object({
  betIds: z
    .string()
    .min(1, "Vui lòng nhập ít nhất một ID")
    .refine((val) => val.trim().length > 0, {
      message: "Vui lòng nhập ít nhất một ID",
    }),
});

type CheckFormValues = z.infer<typeof checkFormSchema>;

interface MultipleCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MultipleCheckDialog({
  open,
  onOpenChange,
}: MultipleCheckDialogProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "won" | "lost" | "pending" | "error"
  >("all");
  const [sortBy, setSortBy] = useState<"default" | "win" | "id">("default");

  // Form với validation
  const form = useForm<CheckFormValues>({
    resolver: zodResolver(checkFormSchema),
    defaultValues: {
      betIds: "",
    },
  });

  const handleCheckResults = async (values: CheckFormValues) => {
    try {
      setIsChecking(true);
      setResults([]);

      // Parse IDs - hỗ trợ nhiều định dạng nhập (comma, space, new line)
      const ids = values.betIds
        .split(/[,\s\n]+/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      if (ids.length === 0) {
        form.setError("betIds", {
          type: "manual",
          message: "Không có ID hợp lệ nào được nhập",
        });
        return;
      }

      // Kiểm tra từng ID
      const checkResults = [];

      for (const id of ids) {
        try {
          const response = await fetch(`/api/bets/check/${id}`);
          const data = await response.json();

          if (response.ok) {
            checkResults.push({
              id,
              success: true,
              ...data,
            });
          } else {
            checkResults.push({
              id,
              success: false,
              error: data.error || "Không tìm thấy phiếu",
            });
          }
        } catch {
          checkResults.push({
            id,
            success: false,
            error: "Lỗi khi kiểm tra phiếu",
          });
        }
      }

      setResults(checkResults);
      setStatusFilter("all");
      setSortBy("default");

      // Hiển thị thông báo tổng kết
      const successCount = checkResults.filter((r) => r.success).length;
      const wonCount = checkResults.filter(
        (r) => r.success && r.status === "won"
      ).length;
      const totalWinAmount = checkResults
        .filter((r) => r.success && r.status === "won")
        .reduce((sum, item) => sum + (item.win_amount || 0), 0);

      if (successCount > 0) {
        toast({
          title: "Kiểm tra hoàn tất",
          description: `Đã kiểm tra ${successCount}/${
            ids.length
          } phiếu. ${wonCount} phiếu trúng thưởng${
            wonCount > 0
              ? ` với tổng số tiền ${formatCurrency(totalWinAmount)}`
              : "."
          }`,
        });
      } else {
        toast({
          title: "Kiểm tra thất bại",
          description: "Không tìm thấy phiếu nào hợp lệ",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error checking multiple bets:", error);
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra các phiếu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Badge style dựa theo status
  const getStatusBadge = (result: any) => {
    if (!result.success) return <Badge variant="destructive">Lỗi</Badge>;

    switch (result.status) {
      case "won":
        return <Badge className="bg-green-500">Trúng thưởng</Badge>;
      case "lost":
        return <Badge variant="destructive">Không trúng</Badge>;
      case "pending":
        return <Badge variant="outline">Đang chờ</Badge>;
      default:
        return <Badge variant="outline">{result.status}</Badge>;
    }
  };

  // Lọc và sắp xếp kết quả
  const filteredResults = results
    .filter((result) => {
      // Lọc theo từ khóa tìm kiếm
      const searchMatches = result.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!searchMatches) return false;

      // Lọc theo trạng thái
      if (statusFilter === "all") return true;
      if (statusFilter === "error" && !result.success) return true;
      if (result.success && result.status === statusFilter) return true;
      return false;
    })
    .sort((a, b) => {
      // Sắp xếp theo tiêu chí đã chọn
      if (sortBy === "win") {
        const aAmount = a.success && a.status === "won" ? a.win_amount || 0 : 0;
        const bAmount = b.success && b.status === "won" ? b.win_amount || 0 : 0;
        return bAmount - aAmount; // Sắp xếp giảm dần theo số tiền thắng
      }
      if (sortBy === "id") {
        return a.id.localeCompare(b.id); // Sắp xếp theo ID
      }
      return 0; // Giữ thứ tự mặc định
    });

  // Tính toán số lượng theo từng trạng thái
  const statusCounts = {
    all: results.length,
    won: results.filter((r) => r.success && r.status === "won").length,
    lost: results.filter((r) => r.success && r.status === "lost").length,
    pending: results.filter((r) => r.success && r.status === "pending").length,
    error: results.filter((r) => !r.success).length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kiểm tra nhiều phiếu</DialogTitle>
          <DialogDescription>
            Nhập ID các phiếu cần kiểm tra, mỗi ID trên một dòng hoặc phân cách
            bởi dấu phẩy, dấu cách.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleCheckResults)}>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Ví dụ:
123e4567-e89b-12d3-a456-426614174000
456e7890-e12b-34d5-a789-426614174123"
              {...form.register("betIds")}
              rows={5}
              className="resize-none"
            />
            {form.formState.errors.betIds && (
              <p className="text-sm text-red-500">
                {form.formState.errors.betIds.message}
              </p>
            )}

            {/* Hiển thị kết quả kiểm tra */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Info className="h-4 w-4" />
                    <span>
                      {statusCounts.all} phiếu
                      {statusCounts.won > 0 && (
                        <span className="text-green-600">
                          {" "}
                          • {statusCounts.won} thắng
                        </span>
                      )}
                      {statusCounts.lost > 0 && (
                        <span className="text-red-500">
                          {" "}
                          • {statusCounts.lost} thua
                        </span>
                      )}
                      {statusCounts.pending > 0 && (
                        <span> • {statusCounts.pending} chờ</span>
                      )}
                      {statusCounts.error > 0 && (
                        <span className="text-gray-400">
                          {" "}
                          • {statusCounts.error} lỗi
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Lọc và sắp xếp */}
                    <div className="flex items-center">
                      <Input
                        type="text"
                        placeholder="Tìm kiếm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 text-xs w-28"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-1 mb-2">
                  <Button
                    type="button"
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="text-xs h-7 px-2"
                  >
                    Tất cả ({statusCounts.all})
                  </Button>
                  <Button
                    type="button"
                    variant={statusFilter === "won" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("won")}
                    className="text-xs h-7 px-2 text-green-600"
                  >
                    <Check className="h-3 w-3 mr-1" /> Thắng ({statusCounts.won}
                    )
                  </Button>
                  <Button
                    type="button"
                    variant={statusFilter === "lost" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("lost")}
                    className="text-xs h-7 px-2 text-red-500"
                  >
                    <X className="h-3 w-3 mr-1" /> Thua ({statusCounts.lost})
                  </Button>
                  <Button
                    type="button"
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("pending")}
                    className="text-xs h-7 px-2"
                  >
                    Chờ ({statusCounts.pending})
                  </Button>
                  <Button
                    type="button"
                    variant={statusFilter === "error" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("error")}
                    className="text-xs h-7 px-2 text-gray-500"
                  >
                    Lỗi ({statusCounts.error})
                  </Button>
                </div>

                <div className="mt-4 border rounded-md divide-y max-h-64 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50"
                      >
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {result.id.slice(0, 13)}...
                            </span>
                            {getStatusBadge(result)}
                          </div>
                          {result.success ? (
                            result.status === "won" ? (
                              <p className="text-sm text-green-600 font-medium">
                                Tiền thưởng: {formatCurrency(result.win_amount)}
                              </p>
                            ) : result.status === "pending" ? (
                              <p className="text-sm text-gray-500">
                                Đang chờ kết quả xổ số
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Phiếu không trúng thưởng
                              </p>
                            )
                          ) : (
                            <p className="text-sm text-red-500">
                              {result.error || "Không thể kiểm tra phiếu này"}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <Link href={`/history/${result.id}`} target="_blank">
                            <Button size="sm" variant="outline" className="h-8">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Chi tiết
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Không tìm thấy phiếu phù hợp với bộ lọc
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Đóng
              </Button>
              <Button type="submit" disabled={isChecking}>
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Kiểm tra
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
