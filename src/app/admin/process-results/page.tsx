// src/app/admin/process-results/page.tsx
"use client";

import { useState } from "react";
import { BatchProcessResults } from "@/components/admin/results/batch-process";
import { PendingBetsList } from "@/components/admin/results/pending-bets-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProcessResultsPage() {
  const [activeTab, setActiveTab] = useState("date");
  const [refreshKey, setRefreshKey] = useState(0);

  // Handler when all bets are processed
  const handleAllProcessed = () => {
    // Refresh the component
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Đối soát kết quả xổ số</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">
              Tổng số cược đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lottery-primary">- -</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">
              Cược đã đối soát hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">- -</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-600">
              Cược thắng tháng này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lottery-secondary">- -</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="date">Đối soát theo ngày</TabsTrigger>
          <TabsTrigger value="all">Danh sách chưa đối soát</TabsTrigger>
        </TabsList>

        <TabsContent value="date" className="space-y-6">
          <p className="text-gray-600 mb-6">
            Tính năng đối soát tự động cho phép hệ thống kiểm tra và cập nhật
            kết quả cho các phiếu cược. Chọn khoảng thời gian để tìm các cược
            cần đối soát, sau đó chọn ngày cụ thể để tiến hành đối soát.
          </p>

          <BatchProcessResults />
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          <p className="text-gray-600 mb-6">
            Hiển thị tất cả các cược chưa đối soát trong hệ thống. Bạn có thể
            đối soát tất cả các cược này cùng một lúc hoặc xem chi tiết từng
            cược.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Tất cả cược chưa đối soát</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingBetsList
                key={refreshKey}
                onAllProcessed={handleAllProcessed}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-8">
        <h3 className="font-medium text-amber-800 mb-2">Lưu ý quan trọng</h3>
        <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
          <li>
            Việc đối soát sẽ kiểm tra kết quả xổ số cho từng phiếu cược và cập
            nhật trạng thái.
          </li>
          <li>
            Số dư của người dùng sẽ được tự động cập nhật với phiếu cược thắng.
          </li>
          <li>Quy trình này không thể hoàn tác sau khi thực hiện.</li>
          <li>
            Đảm bảo kết quả xổ số đã được cập nhật đầy đủ trước khi tiến hành
            đối soát.
          </li>
        </ul>
      </div>
    </div>
  );
}
