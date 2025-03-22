// src/components/history/bet-history-table.tsx
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Map các trạng thái sang Việt ngữ và màu sắc
const statusMap = {
  pending: { text: "Đang chờ", variant: "outline" },
  won: { text: "Đã thắng", variant: "lottery" },
  lost: { text: "Đã thua", variant: "destructive" },
};

export function BetHistoryTable({ bets, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="h-60 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-2">Không có cược nào</p>
        <Link href="/bet">
          <Button variant="lottery">Đặt cược ngay</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Ngày cược</TableHead>
            <TableHead>Ngày xổ</TableHead>
            <TableHead>Loại cược</TableHead>
            <TableHead>Đài</TableHead>
            <TableHead>Số lượng số</TableHead>
            <TableHead>Mệnh giá</TableHead>
            <TableHead className="text-right">Tổng cược</TableHead>
            <TableHead className="text-right">Thắng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.map((bet) => {
            const status = statusMap[bet.status] || {
              text: bet.status,
              variant: "outline",
            };

            return (
              <TableRow key={bet.id}>
                <TableCell className="font-medium">
                  {bet.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {format(new Date(bet.bet_date), "dd/MM/yyyy", { locale: vi })}
                </TableCell>
                <TableCell>
                  {format(new Date(bet.draw_date), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>
                  {bet.bet_variant ? (
                    <span>
                      {bet.bet_type}{" "}
                      <span className="text-xs text-gray-500">
                        ({bet.bet_variant})
                      </span>
                    </span>
                  ) : (
                    bet.bet_type
                  )}
                </TableCell>
                <TableCell>
                  {typeof bet.province === "object" && bet.province?.name
                    ? bet.province.name
                    : bet.province_id}
                </TableCell>
                <TableCell>{bet.numbers?.length || 0} số</TableCell>
                <TableCell>{formatCurrency(bet.denomination)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(bet.total_amount)}
                </TableCell>
                <TableCell className="text-right">
                  {bet.win_amount ? formatCurrency(bet.win_amount) : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.text}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/history/${bet.id}`}>
                    <Button variant="ghost" size="sm">
                      Chi tiết
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
