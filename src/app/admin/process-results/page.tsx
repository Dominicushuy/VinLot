// src/app/admin/process-results/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PendingBetsList } from "@/components/admin/results/pending-bets-list";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  CheckCircle,
  Clock,
  BadgeAlert,
  HelpCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface cho thống kê đối soát
interface ProcessStats {
  pendingCount: number;
  processedToday: number;
  processedThisMonth: number;
  wonThisMonth: number;
  lostThisMonth: number;
}

export default function ProcessResultsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProcessStats>({
    pendingCount: 0,
    processedToday: 0,
    processedThisMonth: 0,
    wonThisMonth: 0,
    lostThisMonth: 0,
  });
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Fetch thống kê đối soát
  const fetchProcessStats = async () => {
    try {
      setLoading(true);
      // Giả sử có một API endpoint để lấy thông tin thống kê
      const response = await fetch("/api/admin/process-stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Nếu không có API hoặc có lỗi, sử dụng dữ liệu giả
        setStats({
          pendingCount: 24,
          processedToday: 47,
          processedThisMonth: 839,
          wonThisMonth: 182,
          lostThisMonth: 657,
        });
      }
    } catch (error) {
      console.error("Error fetching process stats:", error);
      // Sử dụng dữ liệu giả khi có lỗi
      setStats({
        pendingCount: 24,
        processedToday: 47,
        processedThisMonth: 839,
        wonThisMonth: 182,
        lostThisMonth: 657,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler when all bets are processed
  const handleAllProcessed = () => {
    // Refresh the component
    setRefreshKey((prev) => prev + 1);
    fetchProcessStats();
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchProcessStats();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Đối soát kết quả xổ số</h1>
          <p className="text-gray-500 mt-1">
            Quản lý và đối soát các cược dựa trên kết quả xổ số
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setHelpDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <HelpCircle size={16} />
          Hướng dẫn sử dụng
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Cược chưa đối soát"
          value={stats.pendingCount.toString()}
          icon={<Clock className="h-8 w-8 text-blue-500" />}
          description="Đang chờ xử lý"
          loading={loading}
          color="blue"
        />

        <StatCard
          title="Đã đối soát hôm nay"
          value={stats.processedToday.toString()}
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          description="Phiếu đã xử lý"
          loading={loading}
          color="green"
        />

        <StatCard
          title="Cược thắng tháng này"
          value={stats.wonThisMonth.toString()}
          icon={<Award className="h-8 w-8 text-purple-500" />}
          description={`Tỷ lệ: ${(
            (stats.wonThisMonth / (stats.processedThisMonth || 1)) *
            100
          ).toFixed(1)}%`}
          loading={loading}
          color="purple"
        />

        <StatCard
          title="Tiền thưởng tháng này"
          value={formatCurrency(12435000)}
          icon={<BadgeAlert className="h-8 w-8 text-lottery-primary" />}
          description="Tổng giá trị trúng thưởng"
          loading={loading}
          color="lottery-primary"
        />
      </div>

      <PendingBetsList key={refreshKey} onAllProcessed={handleAllProcessed} />

      {/* Dialog hướng dẫn sử dụng */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Hướng dẫn đối soát kết quả
            </DialogTitle>
            <DialogDescription>
              Quy trình và các bước thực hiện đối soát cược xổ số
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">
                Quy trình đối soát
              </h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-2">
                <li>
                  <strong>Kiểm tra kết quả xổ số:</strong> Đảm bảo kết quả xổ số
                  đã được cập nhật đầy đủ cho các tỉnh và ngày cần đối soát
                </li>
                <li>
                  <strong>Tìm kiếm cược:</strong> Sử dụng bộ lọc để tìm các cược
                  cần đối soát (theo ngày, loại cược, tỉnh...)
                </li>
                <li>
                  <strong>Đối soát:</strong> Có thể đối soát từng cược riêng lẻ
                  hoặc chọn nhiều cược để đối soát hàng loạt
                </li>
                <li>
                  <strong>Xác nhận kết quả:</strong> Kiểm tra lại các phiếu đã
                  đối soát, đặc biệt là các phiếu trúng thưởng giá trị cao
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">
                Lưu ý quan trọng
              </h3>
              <ul className="list-disc list-inside text-yellow-700 space-y-2">
                <li>
                  <strong>Không thể hoàn tác:</strong> Sau khi đối soát, trạng
                  thái phiếu cược và số dư người dùng sẽ được cập nhật và không
                  thể hoàn tác
                </li>
                <li>
                  <strong>Kết quả xổ số:</strong> Hệ thống chỉ đối soát được nếu
                  đã có kết quả xổ số cho ngày và tỉnh tương ứng
                </li>
                <li>
                  <strong>Tự động cập nhật số dư:</strong> Khi một phiếu được
                  xác định là thắng, số dư người chơi sẽ tự động được cộng thêm
                </li>
                <li>
                  <strong>Vấn đề đối soát:</strong> Nếu gặp lỗi hoặc có vấn đề
                  với quá trình đối soát, hãy sử dụng công cụ &quot;Đối soát
                  nâng cao&quot; từ menu
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">
                Các tính năng đối soát
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-gray-700">
                  <p className="font-medium mb-1">Đối soát đơn lẻ</p>
                  <p className="text-sm">
                    Xử lý từng phiếu cược riêng biệt, phù hợp để kiểm tra chi
                    tiết từng phiếu
                  </p>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium mb-1">Đối soát hàng loạt</p>
                  <p className="text-sm">
                    Xử lý nhiều phiếu cược cùng lúc, phù hợp để đối soát số
                    lượng lớn
                  </p>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium mb-1">Chức năng lọc</p>
                  <p className="text-sm">
                    Tìm kiếm phiếu theo nhiều điều kiện khác nhau
                  </p>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium mb-1">Báo cáo đối soát</p>
                  <p className="text-sm">
                    Tổng hợp kết quả đối soát và thống kê cược thắng/thua
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setHelpDialogOpen(false)}>Đã hiểu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component card thống kê
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
  color?: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  loading = false,
  color = "blue",
}: StatCardProps) {
  // Map màu sắc
  const colorMap: Record<string, { bg: string; border: string; text: string }> =
    {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
      },
      "lottery-primary": {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-lottery-primary",
      },
    };

  const styles = colorMap[color] || colorMap["blue"];

  return (
    <Card className={`${styles.bg} ${styles.border} border`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
            )}
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className="p-2 rounded-full bg-white/60">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
