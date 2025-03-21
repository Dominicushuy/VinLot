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

export default function BetTypesPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: betTypes, isLoading, isError } = useBetTypes(regionFilter);
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
    await toggleStatus.mutateAsync({
      id,
      isActive: !currentStatus,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý loại cược</h1>
        <Button variant="lottery">
          <Link href="/admin/bet-types/new">Thêm loại cược mới</Link>
        </Button>
      </div>

      <BetTypesImportExport onImport={handleBulkImport} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên hoặc ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={regionFilter}
                onValueChange={(value) => setRegionFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Miền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
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
            <div className="flex justify-center items-center h-40">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-red-500">
                Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại!
              </p>
            </div>
          ) : filteredBetTypes.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Không tìm thấy loại cược nào.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Tên loại cược</TableHead>
                    <TableHead>Miền</TableHead>
                    <TableHead>Biến thể</TableHead>
                    <TableHead>Tỷ lệ thưởng</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBetTypes.map((betType) => (
                    <TableRow key={betType.id}>
                      <TableCell className="font-medium">
                        {betType.bet_type_id}
                      </TableCell>
                      <TableCell>{betType.name}</TableCell>
                      <TableCell>
                        {Object.keys(betType.region_rules).map((region) => (
                          <span
                            key={region}
                            className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1"
                          >
                            {region}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell>
                        {betType.variants ? (
                          <div className="flex flex-wrap gap-1">
                            {betType.variants.map((variant: any) => (
                              <span
                                key={variant.id}
                                className={cn(
                                  "inline-block rounded px-2 py-1 text-xs",
                                  variant.is_active !== false
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-500"
                                )}
                              >
                                {variant.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "Không có"
                        )}
                      </TableCell>
                      <TableCell>
                        {typeof betType.winning_ratio === "number"
                          ? `1:${betType.winning_ratio}`
                          : "Nhiều tỷ lệ"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={betType.is_active !== false}
                          onCheckedChange={() =>
                            handleToggleStatus(
                              betType.id,
                              betType.is_active !== false
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/bet-types/${betType.id}`}>
                            Chỉnh sửa
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center p-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={i + 1 === currentPage ? "lottery" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Sau
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
