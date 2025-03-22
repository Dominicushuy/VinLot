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
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
        } catch (error) {
          checkResults.push({
            id,
            success: false,
            error: "Lỗi khi kiểm tra phiếu",
          });
        }
      }

      setResults(checkResults);

      // Hiển thị thông báo tổng kết
      const successCount = checkResults.filter((r) => r.success).length;
      const wonCount = checkResults.filter(
        (r) => r.success && r.status === "won"
      ).length;

      if (successCount > 0) {
        toast({
          title: "Kiểm tra hoàn tất",
          description: `Đã kiểm tra ${successCount}/${ids.length} phiếu. ${wonCount} phiếu trúng thưởng.`,
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return <Badge className="bg-green-500">Trúng thưởng</Badge>;
      case "lost":
        return <Badge variant="destructive">Không trúng</Badge>;
      case "pending":
        return <Badge variant="outline">Đang chờ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
              <div className="mt-4 border rounded-md divide-y">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {result.id.slice(0, 13)}...
                        </span>
                        {result.success ? (
                          getStatusBadge(result.status)
                        ) : (
                          <Badge variant="destructive">Lỗi</Badge>
                        )}
                      </div>
                      {result.success ? (
                        result.status === "won" ? (
                          <p className="text-sm text-green-600">
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
                      <Link href={`/history/${result.id}`}>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
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
                "Kiểm tra"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
