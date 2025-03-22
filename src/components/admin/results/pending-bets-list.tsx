// src/components/admin/results/pending-bets-list.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CheckCircle } from "lucide-react";

interface PendingBet {
  id: string;
  bet_date: string;
  draw_date: string;
  province_id: string;
  province_name?: string;
  bet_type: string;
  bet_type_name?: string;
  numbers: string[];
  total_amount: number;
}

interface PendingBetsListProps {
  onAllProcessed?: () => void;
}

export function PendingBetsList({ onAllProcessed }: PendingBetsListProps) {
  const { toast } = useToast();
  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  // Fetch pending bets
  const fetchPendingBets = async (pageToFetch = 1, append = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/pending-bets?page=${pageToFetch}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách cược chưa đối soát");
      }

      const data = await response.json();

      if (append) {
        setPendingBets((prev) => [...prev, ...data.bets]);
      } else {
        setPendingBets(data.bets);
      }

      setHasMore(data.hasMore);
      setPage(pageToFetch);
    } catch (error) {
      console.error("Error fetching pending bets:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách cược chưa đối soát",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPendingBets();
  }, []);

  // Process all pending bets
  const processAllPendingBets = async () => {
    if (pendingBets.length === 0) return;

    try {
      setIsProcessing(true);
      const response = await fetch("/api/admin/process-all-pending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Đối soát thất bại");
      }

      const data = await response.json();

      toast({
        title: "Đối soát thành công",
        description: `Đã xử lý ${data.processed} cược, ${data.won} cược thắng.`,
      });

      // Refresh the list
      fetchPendingBets();

      // Notify parent component
      if (onAllProcessed) {
        onAllProcessed();
      }
    } catch (error) {
      console.error("Error processing all pending bets:", error);
      toast({
        title: "Lỗi",
        description: "Đối soát thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Load more data
  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchPendingBets(page + 1, true);
    }
  };

  // If loading, show skeleton
  if (isLoading && pendingBets.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If no pending bets, show message
  if (pendingBets.length === 0 && !isLoading) {
    return (
      <div className="py-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Không có cược nào cần đối soát
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Tất cả các cược đã được đối soát hoặc không có cược nào đang chờ.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Danh sách cược chưa đối soát ({pendingBets.length})
        </h3>
        <Button
          variant="lottery"
          onClick={processAllPendingBets}
          disabled={isProcessing || pendingBets.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đối soát...
            </>
          ) : (
            "Đối soát tất cả"
          )}
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Ngày cược</TableHead>
              <TableHead>Ngày xổ</TableHead>
              <TableHead>Đài</TableHead>
              <TableHead>Loại cược</TableHead>
              <TableHead>Số lượng số</TableHead>
              <TableHead className="text-right">Tiền cược</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingBets.map((bet) => (
              <TableRow key={bet.id}>
                <TableCell className="font-medium">
                  {bet.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {format(new Date(bet.bet_date), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell>
                  {format(new Date(bet.draw_date), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>{bet.province_name || bet.province_id}</TableCell>
                <TableCell>{bet.bet_type_name || bet.bet_type}</TableCell>
                <TableCell>{bet.numbers.length} số</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(bet.total_amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Đang tải..." : "Tải thêm"}
          </Button>
        </div>
      )}
    </div>
  );
}
