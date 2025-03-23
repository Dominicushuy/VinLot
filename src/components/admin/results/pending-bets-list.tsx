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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProcessBets } from "@/lib/hooks/use-process-bets";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

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
  const [totalPages, setTotalPages] = useState(1);
  const [totalBets, setTotalBets] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [betTypeFilter, setBetTypeFilter] = useState("all");
  const [provinces, setProvinces] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [betTypes, setBetTypes] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedBets, setSelectedBets] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // Hàm để lấy danh sách tỉnh và loại cược
  const fetchMetadata = async () => {
    try {
      // Lấy danh sách tỉnh
      const provincesResponse = await fetch("/api/admin/provinces");
      if (provincesResponse.ok) {
        const provincesData = await provincesResponse.json();
        setProvinces(provincesData.provinces || []);
      }

      // Lấy danh sách loại cược
      const betTypesResponse = await fetch("/api/admin/bet-types");
      if (betTypesResponse.ok) {
        const betTypesData = await betTypesResponse.json();
        setBetTypes(betTypesData.betTypes || []);
      }
    } catch (error: any) {
      console.error("Error fetching metadata:", error);
    }
  };

  // Tải danh sách cược pending
  const fetchPendingBets = async (page = 1) => {
    try {
      setLoading(true);

      // Xây dựng URL với các tham số lọc
      let url = `/api/admin/pending-bets?page=${page}&pageSize=${pageSize}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (dateRange?.from) {
        url += `&fromDate=${format(dateRange.from, "yyyy-MM-dd")}`;
      }

      if (dateRange?.to) {
        url += `&toDate=${format(dateRange.to, "yyyy-MM-dd")}`;
      }

      if (provinceFilter !== "all") {
        url += `&provinceId=${provinceFilter}`;
      }

      if (betTypeFilter !== "all") {
        url += `&betType=${betTypeFilter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách cược");
      }

      const data = await response.json();
      setPendingBets(data.bets || []);
      setTotalBets(data.total || 0);
      setCurrentPage(page);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));

      // Reset selection khi tải lại danh sách
      setSelectedBets(new Set());
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
    if (totalBets === 0) return;

    try {
      const result = await processAllBets();

      if (result) {
        toast({
          title: "Thành công",
          description: `Đã đối soát ${result.processed} cược, ${result.won} cược thắng`,
          variant: "lottery",
        });

        // Nếu xử lý xong hết, thông báo
        if (result.processed >= totalBets) {
          if (onAllProcessed) {
            onAllProcessed();
          }
        }

        // Tải lại danh sách
        await fetchPendingBets(1);
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đối soát cược",
        variant: "destructive",
      });
    }
  };

  // Xử lý đối soát nhiều cược đã chọn
  const handleProcessSelected = async () => {
    if (selectedBets.size === 0) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng chọn ít nhất một cược để đối soát",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Hiển thị thông báo đang xử lý
    toast({
      title: "Đang xử lý",
      description: `Đang đối soát ${selectedBets.size} cược...`,
    });

    // Đối soát từng cược đã chọn
    for (const betId of selectedBets) {
      try {
        const result = await processSingleBet(betId);
        if (result && result.status !== "pending") {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing bet ${betId}:`, error);
      }
    }

    // Thông báo kết quả
    toast({
      title: "Hoàn thành",
      description: `Đã đối soát ${successCount} cược thành công${
        errorCount > 0 ? `, ${errorCount} cược thất bại` : ""
      }`,
      variant: successCount > 0 ? "lottery" : "destructive",
    });

    // Tải lại danh sách
    await fetchPendingBets(currentPage);
  };

  // Xử lý đối soát một cược cụ thể
  const handleProcessSingle = async (betId: string) => {
    try {
      const result = await processSingleBet(betId);

      if (result) {
        // Thông báo kết quả
        if (result.status === "won") {
          toast({
            title: "Cược thắng",
            description: `Phiếu cược đã thắng ${formatCurrency(
              result.win_amount || 0
            )}`,
            variant: "lottery",
          });
        } else if (result.status === "lost") {
          toast({
            title: "Cược thua",
            description: "Phiếu cược không trúng thưởng",
          });
        }

        // Cập nhật danh sách cược
        if (result.status !== "pending") {
          setPendingBets(pendingBets.filter((bet) => bet.id !== betId));
          setTotalBets((prev) => prev - 1);
          setSelectedBets((prev) => {
            const newSelected = new Set(prev);
            newSelected.delete(betId);
            return newSelected;
          });
        }
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi đối soát cược",
        variant: "destructive",
      });
    }
  };

  // Xử lý trang trước
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchPendingBets(currentPage - 1);
    }
  };

  // Xử lý trang tiếp theo
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchPendingBets(currentPage + 1);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    fetchPendingBets(1);
  };

  // Xử lý chọn tất cả
  const handleSelectAll = () => {
    if (selectedBets.size === pendingBets.length) {
      // Nếu đã chọn tất cả, bỏ chọn hết
      setSelectedBets(new Set());
    } else {
      // Chọn tất cả
      const allIds = new Set(pendingBets.map((bet) => bet.id));
      setSelectedBets(allIds);
    }
  };

  // Xử lý chọn một cược
  const handleSelectBet = (betId: string) => {
    setSelectedBets((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(betId)) {
        newSelected.delete(betId);
      } else {
        newSelected.add(betId);
      }
      return newSelected;
    });
  };

  // Xử lý reset các bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setProvinceFilter("all");
    setBetTypeFilter("all");
    fetchPendingBets(1);
  };

  // Tải metadata và danh sách khi component mount
  useEffect(() => {
    fetchMetadata();
    fetchPendingBets();
  }, []);

  // Hiển thị skeleton khi đang tải
  if (loading && pendingBets.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
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
      {/* Panel thông tin */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Danh sách cược chưa đối soát
            </h2>
            <p className="text-gray-500">
              {totalBets > 0
                ? `Đang hiển thị ${pendingBets.length} trên tổng số ${totalBets} cược chưa đối soát`
                : "Không có cược chưa đối soát"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter size={16} />
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPendingBets(currentPage)}
              disabled={loading || isProcessing}
              className="flex items-center gap-1"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Bộ lọc */}
        {showFilters && (
          <Card className="mb-6 bg-gray-50 border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Bộ lọc tìm kiếm</CardTitle>
              <CardDescription>
                Lọc danh sách cược theo các điều kiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Từ khóa</label>
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Khoảng thời gian
                  </label>
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Đài xổ số</label>
                  <Select
                    value={provinceFilter}
                    onValueChange={setProvinceFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả đài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả đài</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại cược</label>
                  <Select
                    value={betTypeFilter}
                    onValueChange={setBetTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả loại cược" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại cược</SelectItem>
                      {betTypes.map((betType) => (
                        <SelectItem key={betType.id} value={betType.id}>
                          {betType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                >
                  Xóa bộ lọc
                </Button>
                <Button
                  variant="lottery"
                  size="sm"
                  onClick={() => fetchPendingBets(1)}
                >
                  Áp dụng
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kết quả đối soát */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
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
          </div>
        )}

        {/* Danh sách cược và công cụ đối soát */}
        {pendingBets.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-1"
                >
                  <CheckSquare
                    size={16}
                    className={
                      selectedBets.size === pendingBets.length
                        ? "text-lottery-primary"
                        : ""
                    }
                  />
                  {selectedBets.size === pendingBets.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </Button>
                <span className="ml-4 text-sm text-gray-500">
                  Đã chọn {selectedBets.size} cược
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {selectedBets.size > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleProcessSelected}
                    disabled={isProcessing || selectedBets.size === 0}
                  >
                    Đối soát đã chọn ({selectedBets.size})
                  </Button>
                )}

                <Button
                  variant="lottery"
                  onClick={handleProcessAll}
                  disabled={isProcessing || totalBets === 0}
                >
                  {isProcessing ? "Đang đối soát..." : "Đối soát tất cả"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <span className="sr-only">Chọn</span>
                    </TableHead>
                    <TableHead className="w-[100px]">Ngày xổ</TableHead>
                    <TableHead>Đài</TableHead>
                    <TableHead>Loại cược</TableHead>
                    <TableHead>Số cược</TableHead>
                    <TableHead className="text-right">Tiền cược</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBets.map((bet) => (
                    <TableRow
                      key={bet.id}
                      className={selectedBets.has(bet.id) ? "bg-blue-50" : ""}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedBets.has(bet.id)}
                          onChange={() => handleSelectBet(bet.id)}
                          className="rounded border-gray-300 text-lottery-primary focus:ring-lottery-primary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar
                            size={14}
                            className="text-gray-400 mr-1.5"
                          />
                          {format(new Date(bet.draw_date), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {bet.province_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {bet.bet_type_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {bet.numbers.slice(0, 4).map((number, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-gray-50"
                            >
                              {number}
                            </Badge>
                          ))}
                          {bet.numbers.length > 4 && (
                            <Badge variant="outline" className="bg-gray-50">
                              +{bet.numbers.length - 4}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(bet.total_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="lottery"
                          size="sm"
                          onClick={() => handleProcessSingle(bet.id)}
                          className="whitespace-nowrap"
                        >
                          Đối soát
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || loading}
                    className="w-9 p-0"
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Tính toán trang để hiển thị phân trang hợp lý
                    let pageToShow;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    } else {
                      pageToShow = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={
                          currentPage === pageToShow ? "lottery" : "outline"
                        }
                        size="sm"
                        onClick={() => fetchPendingBets(pageToShow)}
                        disabled={loading}
                        className="w-9 p-0"
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || loading}
                    className="w-9 p-0"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Hiển thị khi không có cược
          <div className="border rounded-md p-8 mt-4 flex flex-col items-center justify-center text-center bg-gray-50">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Không có cược chưa đối soát
            </h3>
            <p className="text-gray-500 max-w-md">
              Tất cả các cược đã được đối soát hoặc chưa có cược nào được tạo.
              Nếu mới tạo cược, vui lòng đợi kết quả xổ số được cập nhật trước
              khi đối soát.
            </p>
          </div>
        )}
      </div>

      {/* Hướng dẫn đối soát */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 text-lg">
          Hướng dẫn đối soát
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">
              Quy trình đối soát
            </h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>
                Đối soát các cược sẽ cập nhật trạng thái thắng/thua và số tiền
                thắng
              </li>
              <li>Cược thắng sẽ tự động cập nhật số dư người chơi</li>
              <li>Có thể đối soát từng cược hoặc nhiều cược cùng lúc</li>
              <li>Việc đối soát sẽ kiểm tra kết quả đã có trên hệ thống</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Lưu ý quan trọng</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>
                Đảm bảo kết quả xổ số đã được cập nhật đầy đủ trước khi đối soát
              </li>
              <li>Quá trình đối soát không thể hoàn tác sau khi thực hiện</li>
              <li>Sử dụng bộ lọc để tìm các cược cụ thể cần đối soát</li>
              <li>
                Hệ thống tự động áp dụng quy tắc trúng thưởng theo từng loại
                cược
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
