// src/components/history/bet-detail.tsx
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BetDetail({ bet, province, betType, results }) {
  // Nếu chưa có kết quả, hiển thị đang chờ
  if (!results && bet.status === "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đối soát kết quả</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-500"
              >
                <path d="M5 22h14" />
                <path d="M5 2h14" />
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-700">
              Đang chờ kết quả
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Kết quả xổ số chưa có hoặc đang trong quá trình đối soát
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Nếu đã có kết quả
  if (results) {
    // Hiển thị cược đã thắng
    if (bet.status === "won") {
      return (
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-700">Kết quả đối soát</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-green-700">
                Chúc mừng! Bạn đã thắng
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(bet.win_amount)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Chi tiết đối soát</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền đặt:</span>
                  <span>{formatCurrency(bet.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền thắng:</span>
                  <span className="font-medium">
                    {formatCurrency(bet.win_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lợi nhuận:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(bet.win_amount - bet.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Các số trúng</h4>
              <div className="flex flex-wrap gap-2">
                {/* Giả định về các số trúng - cần một logic phức tạp hơn để xác định chính xác */}
                {bet.numbers.map((number, index) => (
                  <Badge
                    key={index}
                    variant={true ? "lottery" : "outline"}
                    className="px-3 py-1"
                  >
                    {number}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Hiển thị cược đã thua
    return (
      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-700">Kết quả đối soát</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-red-700">
              Rất tiếc! Bạn đã thua
            </h3>
            <p className="text-gray-600 mt-2">
              Các số của bạn không trùng với kết quả xổ số
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Chi tiết đối soát</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền đặt:</span>
                <span>{formatCurrency(bet.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền thắng:</span>
                <span>0 ₫</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Đừng nản lòng! Thử lại vận may của bạn với một cược khác.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mặc định (không có đủ thông tin)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin đối soát</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Không có thông tin đối soát</p>
      </CardContent>
    </Card>
  );
}
