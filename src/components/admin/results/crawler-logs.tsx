"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { useCrawlerLogs } from "@/lib/hooks/use-crawler";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CrawlerLogs() {
  const [filter, setFilter] = useState<{
    status: "all" | "success" | "error";
    region: "all" | "mien-bac" | "mien-trung" | "mien-nam";
    searchTerm: string;
  }>({
    status: "all",
    region: "all",
    searchTerm: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  // Fetch logs with filtering
  const { data: logs = [], isLoading } = useCrawlerLogs({
    status: filter.status === "all" ? undefined : filter.status,
    region: filter.region === "all" ? undefined : filter.region,
    searchTerm: filter.searchTerm || undefined,
  });

  // Pagination logic
  const totalPages = Math.ceil(logs.length / pageSize);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const viewLogDetails = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const regionLabel = (region: string) => {
    switch (region) {
      case "mien-bac":
        return "Miền Bắc";
      case "mien-trung":
        return "Miền Trung";
      case "mien-nam":
        return "Miền Nam";
      default:
        return region;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử lấy kết quả</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-64">
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter({ ...filter, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="error">Lỗi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-64">
              <Select
                value={filter.region}
                onValueChange={(value) =>
                  setFilter({ ...filter, region: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Miền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả miền</SelectItem>
                  <SelectItem value="mien-bac">Miền Bắc</SelectItem>
                  <SelectItem value="mien-trung">Miền Trung</SelectItem>
                  <SelectItem value="mien-nam">Miền Nam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo ngày (yyyy-mm-dd)"
                value={filter.searchTerm}
                onChange={(e) =>
                  setFilter({ ...filter, searchTerm: e.target.value })
                }
              />
            </div>
          </div>

          {/* Logs table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Không tìm thấy dữ liệu logs nào.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Miền</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Kết quả</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>{regionLabel(log.region)}</TableCell>
                      <TableCell>
                        {log.type === "auto" ? "Tự động" : "Thủ công"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            log.status === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {log.status === "success" ? "Thành công" : "Lỗi"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.resultCount
                          ? `${log.resultCount} kết quả`
                          : log.error || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewLogDetails(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4">
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

      {/* Log details modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết log - {selectedLog?.date}</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Thời gian</p>
                  <p className="font-medium">
                    {selectedLog.date} {selectedLog.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loại</p>
                  <p className="font-medium">
                    {selectedLog.type === "auto" ? "Tự động" : "Thủ công"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Miền</p>
                  <p className="font-medium">
                    {regionLabel(selectedLog.region)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      selectedLog.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {selectedLog.status === "success" ? "Thành công" : "Lỗi"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thời gian xử lý</p>
                  <p className="font-medium">{selectedLog.duration}ms</p>
                </div>
              </div>

              {selectedLog.status === "error" && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Lỗi</p>
                  <div className="bg-red-50 p-3 rounded border border-red-200 mt-1 text-red-800">
                    {selectedLog.error}
                  </div>
                </div>
              )}

              {selectedLog.status === "success" && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Kết quả</p>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-1 overflow-x-auto">
                    <pre className="text-xs">
                      {JSON.stringify(selectedLog.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
