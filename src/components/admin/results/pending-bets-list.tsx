// src/components/admin/results/pending-bets-list.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useProcessBets } from "@/lib/hooks/use-process-bets";

interface PendingBet {
  id: string;
  bet_date: string;
  draw_date: string;
  province_id: string;
  province_name: string;
  bet_type: string;
  bet_type_name: string;
  numbers: string[];
  total_amount: number;
}

interface PendingBetsListProps {
  onAllProcessed?: () => void;
}

export function PendingBetsList({ onAllProcessed }: PendingBetsListProps) {
  const { toast } = useToast();
  const { isProcessing, result, processAllBets, processSingleBet } =
    useProcessBets();
  const [pendingBets, setPendingBets] = useState<PendingBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalBets, setTotalBets] = useState(0);
  const pageSize = 10; // Số lượng cược trên mỗi trang

  // Tải danh sách cược pending
  const fetchPendingBets = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/pending-bets?page=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách cược");
      }

      const data = await response.json();
      setPendingBets(data.bets || []);
      setHasMore(data.hasMore || false);
      setTotalBets(data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching pending bets:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy danh sách cược chưa đối soát",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đối soát tất cả
  const handleProcessAll = async () => {
    const result = await processAllBets();

    if (result) {
      // Nếu xử lý xong hết, thông báo
      if (result.processed >= totalBets) {
        if (onAllProcessed) {
          onAllProcessed();
        }
      } else {
        // Còn cược cần xử lý, tải lại danh sách
        await fetchPendingBets(1);
      }
    }
  };

  // Xử lý đối soát một cược cụ thể
  const handleProcessSingle = async (betId: string) => {
    const result = await processSingleBet(betId);

    if (result && result.status !== "pending") {
      // Xóa cược đã xử lý khỏi danh sách
      setPendingBets(pendingBets.filter((bet) => bet.id !== betId));
      setTotalBets((prev) => prev - 1);
    }
  };

  // Tải trang tiếp theo
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchPendingBets(currentPage + 1);
    }
  };

  // Tải lại danh sách
  const handleRefresh = () => {
    fetchPendingBets(1);
  };

  // Tải danh sách khi component mount
  useEffect(() => {
    fetchPendingBets();
  }, []);

  if (loading && pendingBets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">
            {totalBets > 0
              ? `${totalBets} cược chưa đối soát`
              : "Không có cược chưa đối soát"}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading || isProcessing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="sr-only">Làm mới</span>
          </Button>
        </div>
        {totalBets > 0 && (
          <Button
            variant="lottery"
            onClick={handleProcessAll}
            disabled={isProcessing || totalBets === 0}
          >
            {isProcessing ? "Đang đối soát..." : "Đối soát tất cả"}
          </Button>
        )}
      </div>

      {result && (
        <Card className="p-4 bg-green-50 border border-green-200">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-700">
                Đã đối soát {result.processed} cược
              </h4>
              <p className="text-sm text-green-600 mt-1">
                {result.won} cược thắng, {result.processed - result.won} cược
                thua
                {result.processed < result.total &&
                  `, còn ${result.total - result.processed} cược chưa xử lý`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {pendingBets.length > 0 ? (
        <div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ngày xổ</TableHead>
                  <TableHead>Đài</TableHead>
                  <TableHead>Loại cược</TableHead>
                  <TableHead>Số cược</TableHead>
                  <TableHead className="text-right">Tiền cược</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell className="font-medium">
                      {format(new Date(bet.draw_date), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>{bet.province_name}</TableCell>
                    <TableCell>{bet.bet_type_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {bet.numbers.slice(0, 3).map((number, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-white"
                          >
                            {number}
                          </Badge>
                        ))}
                        {bet.numbers.length > 3 && (
                          <Badge variant="outline" className="bg-white">
                            +{bet.numbers.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bet.total_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProcessSingle(bet.id)}
                      >
                        Đối soát
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading || isProcessing}
              >
                {loading ? "Đang tải..." : "Tải thêm"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Không có cược chưa đối soát
            </h3>
            <p className="text-gray-500 max-w-md">
              Tất cả các cược đã được đối soát hoặc chưa có cược nào được tạo.
            </p>
          </div>
        )
      )}
    </div>
  );
}
