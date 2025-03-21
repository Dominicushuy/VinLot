// src/app/admin/provinces/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useProvincesByRegion,
  useToggleProvinceStatus,
} from "@/lib/hooks/use-provinces";
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
import { cn, dayOfWeekMap } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

export default function ProvincesPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: provinces,
    isLoading,
    isError,
  } = useProvincesByRegion(regionFilter === "all" ? "" : regionFilter);
  const toggleStatus = useToggleProvinceStatus();

  // Filter provinces based on search text
  const filteredProvinces = provinces
    ? provinces.filter(
        (province) =>
          province.name.toLowerCase().includes(search.toLowerCase()) ||
          province.province_id.toLowerCase().includes(search.toLowerCase()) ||
          (province.code &&
            province.code.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredProvinces?.length || 0) / pageSize);
  const paginatedProvinces = filteredProvinces.slice(
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
        title: "Thành công",
        description: "Đã cập nhật trạng thái đài xổ số",
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại!",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý đài xổ số</h1>
        <Button variant="lottery">
          <Link href="/admin/provinces/new">Thêm đài xổ số mới</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên, mã hoặc ID"
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
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="mien-bac">Miền Bắc</SelectItem>
                  <SelectItem value="mien-trung">Miền Trung</SelectItem>
                  <SelectItem value="mien-nam">Miền Nam</SelectItem>
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
          ) : filteredProvinces.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Không tìm thấy đài xổ số nào.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Tên đài</TableHead>
                    <TableHead>Mã đài</TableHead>
                    <TableHead>Miền</TableHead>
                    <TableHead>Loại miền</TableHead>
                    <TableHead>Ngày xổ</TableHead>
                    <TableHead className="w-[100px] text-center">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProvinces.map((province) => (
                    <TableRow key={province.id}>
                      <TableCell className="font-medium">
                        {province.province_id}
                      </TableCell>
                      <TableCell>{province.name}</TableCell>
                      <TableCell>{province.code || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded px-2 py-1 text-xs",
                            province.region === "mien-bac"
                              ? "bg-blue-100 text-blue-800"
                              : province.region === "mien-trung"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {province.region === "mien-bac"
                            ? "Miền Bắc"
                            : province.region === "mien-trung"
                            ? "Miền Trung"
                            : "Miền Nam"}
                        </span>
                      </TableCell>
                      <TableCell>{province.region_type}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {province.draw_days.map((day) => (
                            <span
                              key={day}
                              className="inline-block bg-gray-100 rounded px-2 py-1 text-xs"
                            >
                              {dayOfWeekMap[day] || day}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={province.is_active !== false}
                          onCheckedChange={() =>
                            handleToggleStatus(
                              province.id,
                              province.is_active !== false
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/provinces/${province.id}`}>
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
