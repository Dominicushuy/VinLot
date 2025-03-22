"use client";

import { BatchProcessResults } from "@/components/admin/results/batch-process";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessResultsPage() {
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

      <div className="space-y-6">
        <p className="text-gray-600 mb-6">
          Tính năng đối soát tự động cho phép hệ thống kiểm tra và cập nhật kết
          quả cho các phiếu cược. Chọn khoảng thời gian để tìm các cược cần đối
          soát, sau đó chọn ngày cụ thể để tiến hành đối soát.
        </p>

        <BatchProcessResults />

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-8">
          <h3 className="font-medium text-amber-800 mb-2">Lưu ý quan trọng</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            <li>
              Việc đối soát sẽ kiểm tra kết quả xổ số cho từng phiếu cược và cập
              nhật trạng thái.
            </li>
            <li>
              Số dư của người dùng sẽ được tự động cập nhật với phiếu cược
              thắng.
            </li>
            <li>Quy trình này không thể hoàn tác sau khi thực hiện.</li>
            <li>
              Đảm bảo kết quả xổ số đã được cập nhật đầy đủ trước khi tiến hành
              đối soát.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
