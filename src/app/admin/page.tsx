import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Quản Trị</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/bet-types">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="bg-lottery-primary text-white rounded-t-lg">
              <CardTitle>Quản lý loại cược</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>Quản lý danh sách loại cược, biến thể và tỷ lệ thưởng</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/provinces">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="bg-lottery-secondary text-white rounded-t-lg">
              <CardTitle>Quản lý đài xổ số</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>Quản lý danh sách đài xổ số và lịch mở thưởng</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/results">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="bg-green-600 text-white rounded-t-lg">
              <CardTitle>Kết quả xổ số</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>Cấu hình và quản lý crawling kết quả xổ số</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border">
                <p className="text-gray-500 mb-1">Tổng loại cược</p>
                <p className="text-2xl font-bold">8</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border">
                <p className="text-gray-500 mb-1">Tổng đài xổ số</p>
                <p className="text-2xl font-bold">63</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border">
                <p className="text-gray-500 mb-1">Kết quả đã cập nhật</p>
                <p className="text-2xl font-bold">Hôm nay (21/03/2025)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
