"use client";

import { useState } from "react";
import { useUserBets } from "@/lib/hooks/use-user-bets";
import { useBetTypes } from "@/lib/hooks/use-bet-types";
import { useProvincesByRegion } from "@/lib/hooks/use-provinces";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { BetHistoryTable } from "@/components/history/bet-history-table";
import { BetSummaryCard } from "@/components/history/bet-summary-card";
import { MultipleCheckDialog } from "@/components/history/multiple-check-dialog";
import { formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";

// Fake user ID for demo
const DEMO_USER_ID = "3a652095-83ce-4c36-aa89-cef8bdeaf7c8";

export default function HistoryPage() {
  // State để quản lý filters
  const [status, setStatus] = useState<"all" | "pending" | "won" | "lost">(
    "all"
  );
  // Thay đổi kiểu dữ liệu để tương thích với DateRange từ react-day-picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [betType, setBetType] = useState<string>("all");
  const [provinceId, setProvinceId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCheckDialogOpen, setIsCheckDialogOpen] = useState(false);

  // Hàm xử lý thay đổi range date
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  // Load dữ liệu
  const { data: bets, isLoading } = useUserBets({
    userId: DEMO_USER_ID,
    status: status !== "all" ? status : undefined,
    startDate: dateRange?.from
      ? dateRange.from.toISOString().split("T")[0]
      : undefined,
    endDate: dateRange?.to
      ? dateRange.to.toISOString().split("T")[0]
      : undefined,
    betType: betType === "all" ? undefined : betType,
    provinceId: provinceId === "all" ? undefined : provinceId,
  });

  const { data: betTypes } = useBetTypes();
  const { data: provinces } = useProvincesByRegion();

  // Tính toán các tổng hợp
  const totalBets = bets?.length || 0;
  const totalAmount =
    bets?.reduce((sum, bet) => sum + bet.total_amount, 0) || 0;
  const totalWinAmount =
    bets?.reduce((sum, bet) => sum + (bet.win_amount || 0), 0) || 0;
  const netResult = totalWinAmount - totalAmount;

  // Filter dựa trên từ khóa tìm kiếm
  const filteredBets = bets?.filter((bet) => {
    if (!searchTerm) return true;

    // Tìm trong số cược
    const numberMatches = bet.numbers.some((num: string) =>
      num.includes(searchTerm)
    );

    // Tìm trong tỉnh/thành
    const provinceMatches = bet.province?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return numberMatches || provinceMatches;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-lottery-primary">
        Lịch sử cược
      </h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tổng hợp</h2>
        <Button variant="secondary" onClick={() => setIsCheckDialogOpen(true)}>
          Kiểm tra nhiều phiếu
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <BetSummaryCard
          title="Tổng cược"
          value={totalBets}
          subValue={formatCurrency(totalAmount)}
          icon="ticket"
        />
        <BetSummaryCard
          title="Đang chờ"
          value={bets?.filter((b) => b.status === "pending").length || 0}
          subValue={formatCurrency(
            bets
              ?.filter((b) => b.status === "pending")
              .reduce((sum, bet) => sum + bet.total_amount, 0) || 0
          )}
          icon="hourglass"
        />
        <BetSummaryCard
          title="Đã thắng"
          value={bets?.filter((b) => b.status === "won").length || 0}
          subValue={formatCurrency(totalWinAmount)}
          icon="trophy"
          valueColor="text-green-600"
        />
        <BetSummaryCard
          title="Lợi nhuận"
          value={formatCurrency(netResult)}
          subValue={`${((netResult / (totalAmount || 1)) * 100).toFixed(1)}%`}
          icon="trending-up"
          valueColor={netResult >= 0 ? "text-green-600" : "text-red-500"}
        />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Thời gian</Label>
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="betType">Loại cược</Label>
              <Select value={betType} onValueChange={setBetType}>
                <SelectTrigger id="betType">
                  <SelectValue placeholder="Tất cả loại cược" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại cược</SelectItem>
                  {betTypes?.map((type) => (
                    <SelectItem key={type.bet_type_id} value={type.bet_type_id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Đài xổ số</Label>
              <Select value={provinceId} onValueChange={setProvinceId}>
                <SelectTrigger id="province">
                  <SelectValue placeholder="Tất cả đài" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đài</SelectItem>
                  {provinces?.map((province) => (
                    <SelectItem
                      key={province.province_id}
                      value={province.province_id}
                    >
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Tìm kiếm số, đài,..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setStatus("all");
                setBetType("all");
                setProvinceId("all");
                setSearchTerm("");
                setDateRange(undefined);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="all"
        value={status}
        onValueChange={(value) =>
          setStatus(value as "all" | "pending" | "won" | "lost")
        }
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Đang chờ</TabsTrigger>
          <TabsTrigger value="won">Đã thắng</TabsTrigger>
          <TabsTrigger value="lost">Đã thua</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <BetHistoryTable bets={filteredBets} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          <BetHistoryTable
            bets={filteredBets?.filter((bet) => bet.status === "pending")}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="won" className="mt-0">
          <BetHistoryTable
            bets={filteredBets?.filter((bet) => bet.status === "won")}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="lost" className="mt-0">
          <BetHistoryTable
            bets={filteredBets?.filter((bet) => bet.status === "lost")}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog kiểm tra nhiều phiếu */}
      <MultipleCheckDialog
        open={isCheckDialogOpen}
        onOpenChange={setIsCheckDialogOpen}
      />
    </div>
  );
}
