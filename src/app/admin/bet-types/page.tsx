"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useBetTypes,
  useToggleBetTypeStatus,
  useCreateBetType,
} from "@/lib/hooks/use-bet-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BetTypesImportExport } from "@/components/admin/bet-types-import-export";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function BetTypesPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: betTypes,
    isLoading,
    isError,
  } = useBetTypes(regionFilter === "all" ? "" : regionFilter);
  const toggleStatus = useToggleBetTypeStatus();
  const createBetType = useCreateBetType();

  // Handle bulk import
  const handleBulkImport = async (data: any[]) => {
    try {
      // Create each bet type one by one
      for (const item of data) {
        await createBetType.mutateAsync(item);
      }

      toast({
        title: "Nhập dữ liệu thành công",
        description: `Đã nhập ${data.length} loại cược`,
      });
    } catch (error) {
      console.error("Bulk import error:", error);
      throw error;
    }
  };

  // Filter bet types based on search text
  const filteredBetTypes = betTypes
    ? betTypes.filter(
        (betType) =>
          betType.name.toLowerCase().includes(search.toLowerCase()) ||
          betType.bet_type_id.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredBetTypes?.length || 0) / pageSize);
  const paginatedBetTypes = filteredBetTypes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleStatus.mutateAsync({
        id,
        isActive: !currentStatus,
      });

      toast({
        title: `Loại cược đã ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"}`,
        description: `Trạng thái đã được cập nhật thành công.`,
      });
    } catch {
      toast({
        title: "Lỗi cập nhật trạng thái",
        description:
          "Không thể thay đổi trạng thái loại cược. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Quản lý loại cược</h1>
        <Button variant="default" className="bg-green-600 hover:bg-green-700">
          <Link href="/admin/bet-types/new" className="flex items-center">
            <span className="mr-2">+</span> Thêm loại cược mới
          </Link>
        </Button>
      </div>

      <BetTypesImportExport onImport={handleBulkImport} />

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Tìm kiếm theo tên hoặc ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={regionFilter}
                onValueChange={(value) => {
                  setRegionFilter(value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Miền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="M1">M1 (Miền Nam & Trung)</SelectItem>
                  <SelectItem value="M2">M2 (Miền Bắc)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
              <p className="text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-60">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg text-red-600 font-medium mb-2">
                Đã có lỗi xảy ra khi tải dữ liệu
              </p>
              <p className="text-gray-500">
                Vui lòng làm mới trang hoặc thử lại sau
              </p>
            </div>
          ) : filteredBetTypes.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-60">
              <Info className="h-12 w-12 text-blue-500 mb-4" />
              <p className="text-lg font-medium mb-2">
                Không tìm thấy loại cược nào
              </p>
              <p className="text-gray-500 mb-6">
                {search
                  ? `Không có kết quả cho "${search}". Vui lòng thử với từ khóa khác.`
                  : "Không có loại cược nào trong hệ thống."}
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/bet-types/new">+ Thêm loại cược mới</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[80px] font-semibold">
                        ID
                      </TableHead>
                      <TableHead className="font-semibold">
                        Tên loại cược
                      </TableHead>
                      <TableHead className="font-semibold">Miền</TableHead>
                      <TableHead className="font-semibold">Biến thể</TableHead>
                      <TableHead className="font-semibold">
                        Tỷ lệ thưởng
                      </TableHead>
                      <TableHead className="w-[100px] text-center font-semibold">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-right w-[100px] font-semibold">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBetTypes.map((betType) => (
                      <TableRow key={betType.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600">
                          {betType.bet_type_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {betType.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Object.keys(betType.region_rules).map((region) => (
                              <Badge
                                key={region}
                                variant="outline"
                                className={cn(
                                  "bg-gray-100/70 hover:bg-gray-100 text-gray-800",
                                  region === "M1" &&
                                    "bg-blue-100/70 hover:bg-blue-100 text-blue-800 border-blue-200",
                                  region === "M2" &&
                                    "bg-green-100/70 hover:bg-green-100 text-green-800 border-green-200"
                                )}
                              >
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {betType.variants ? (
                            <div className="flex flex-wrap gap-1">
                              {betType.variants
                                .slice(0, 3)
                                .map((variant: any) => (
                                  <Badge
                                    key={variant.id}
                                    variant="outline"
                                    className={cn(
                                      "transition-colors",
                                      variant.is_active !== false
                                        ? "bg-purple-100/70 hover:bg-purple-100 text-purple-800 border-purple-200"
                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                    )}
                                  >
                                    {variant.name}
                                  </Badge>
                                ))}
                              {betType.variants.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="bg-gray-100 text-gray-600 border-gray-200"
                                >
                                  +{betType.variants.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm italic">
                              Không có
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {typeof betType.winning_ratio === "number" ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                              1:{betType.winning_ratio}
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                              Nhiều tỷ lệ
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={betType.is_active !== false}
                              onCheckedChange={() =>
                                handleToggleStatus(
                                  betType.id,
                                  betType.is_active !== false
                                )
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Link href={`/admin/bet-types/${betType.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-4 border-t">
                  <div className="text-sm text-gray-500">
                    Hiển thị {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, filteredBetTypes.length)}{" "}
                    trong số {filteredBetTypes.length} loại cược
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>

                    {totalPages <= 5 ? (
                      // If 5 or fewer pages, show all
                      Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                          key={i}
                          variant={
                            i + 1 === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className={
                            i + 1 === currentPage
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      // If more than 5 pages, show current +/- 1 and first/last
                      <>
                        {/* First page */}
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className={
                            currentPage === 1
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }
                        >
                          1
                        </Button>

                        {/* Ellipsis if needed */}
                        {currentPage > 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="cursor-default"
                          >
                            ...
                          </Button>
                        )}

                        {/* Pages around current */}
                        {Array.from({ length: 3 })
                          .map((_, i) => currentPage - 1 + i)
                          .filter((page) => page > 1 && page < totalPages)
                          .map((page) => (
                            <Button
                              key={page}
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={
                                page === currentPage
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : ""
                              }
                            >
                              {page}
                            </Button>
                          ))}

                        {/* Ellipsis if needed */}
                        {currentPage < totalPages - 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="cursor-default"
                          >
                            ...
                          </Button>
                        )}

                        {/* Last page */}
                        <Button
                          variant={
                            currentPage === totalPages ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className={
                            currentPage === totalPages
                              ? "bg-blue-600 hover:bg-blue-700"
                              : ""
                          }
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
