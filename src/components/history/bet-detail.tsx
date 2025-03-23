// src/components/history/bet-detail.tsx
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BetDetailAnalysis } from "./bet-detail-analysis";

// Define interfaces for props
interface Bet {
  id: string;
  status: "pending" | "won" | "lost";
  numbers: string[];
  total_amount: number;
  win_amount?: number;
  bet_type: string;
  bet_variant?: string;
  denomination: number;
  winning_details?: {
    winning_numbers: string[];
    details: Array<{
      number: string;
      prize_type: string;
      prize_name: string;
      description: string;
      win_amount: number;
    }>;
  };
  // Thêm các field khác nếu cần
}

interface Province {
  name: string;
  province_id?: string;
  // Thêm các field khác nếu cần
}

interface BetType {
  name: string;
  bet_type_id?: string;
  winning_ratio?: any;
  variants?: any;
  // Thêm các field khác nếu cần
}

interface Result {
  id: string;
  date: string;
  special_prize?: string[];
  first_prize?: string[];
  second_prize?: string[];
  third_prize?: string[];
  fourth_prize?: string[];
  fifth_prize?: string[];
  sixth_prize?: string[];
  seventh_prize?: string[];
  eighth_prize?: string[];
  // Thêm các field khác nếu cần
}

interface BetDetailProps {
  bet: Bet;
  province: Province | null;
  betType: BetType | null;
  results: Result | null;
}

// Đây là phiên bản đơn giản để xác định các số trúng
// Trong môi trường thực tế, bạn cần logic phức tạp hơn theo từng loại cược
function determineWinningNumbers(bet: Bet, results: Result): string[] {
  // Nếu đã có chi tiết trong database, ưu tiên dùng
  if (bet.winning_details && bet.winning_details.winning_numbers.length > 0) {
    return bet.winning_details.winning_numbers;
  }

  // Nếu không có, sử dụng logic cũ để tương thích ngược
  const lastTwoDigits: string[] = [];
  const allPrizes = [
    ...(results.special_prize || []),
    ...(results.first_prize || []),
    ...(results.second_prize || []),
    ...(results.third_prize || []),
    ...(results.fourth_prize || []),
    ...(results.fifth_prize || []),
    ...(results.sixth_prize || []),
    ...(results.seventh_prize || []),
    ...(results.eighth_prize || []),
  ];

  // Lấy hai số cuối của tất cả giải
  allPrizes.forEach((prize) => {
    if (prize) {
      lastTwoDigits.push(prize.slice(-2));
    }
  });

  // Tìm các số trong cược trùng với kết quả
  return bet.numbers.filter((num) => lastTwoDigits.includes(num));
}

// Hàm lấy tỷ lệ thưởng theo loại cược và biến thể
function getWinRatio(betType: BetType | null, bet: Bet): number | string {
  if (!betType || !betType.winning_ratio) return "N/A";

  const winningRatio =
    typeof betType.winning_ratio === "string"
      ? JSON.parse(betType.winning_ratio)
      : betType.winning_ratio;

  if (typeof winningRatio === "number") return winningRatio;

  if (bet.bet_variant && winningRatio[bet.bet_variant]) {
    if (typeof winningRatio[bet.bet_variant] === "number") {
      return winningRatio[bet.bet_variant];
    } else {
      // Đối với các loại cược phức tạp như Đá có nhiều tỷ lệ
      return "Xem bảng tỷ lệ";
    }
  }

  return "N/A";
}

export function BetDetail({ bet, province, betType, results }: BetDetailProps) {
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
    const winningNumbers =
      bet.status === "won" ? determineWinningNumbers(bet, results) : [];
    const winRatio = getWinRatio(betType, bet);

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
                {formatCurrency(bet.win_amount || 0)}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Chi tiết đối soát</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại cược:</span>
                  <span>
                    {betType?.name || bet.bet_type}
                    {bet.bet_variant && ` (${bet.bet_variant})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ lệ thưởng:</span>
                  <span>{winRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mệnh giá:</span>
                  <span>{formatCurrency(bet.denomination)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền đặt:</span>
                  <span>{formatCurrency(bet.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền thắng:</span>
                  <span className="font-medium">
                    {formatCurrency(bet.win_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lợi nhuận:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency((bet.win_amount || 0) - bet.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3">Chi tiết số trúng thưởng</h4>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Các số đã đánh ({bet.numbers.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {bet.numbers.map((number, index) => (
                    <Badge
                      key={index}
                      variant={
                        winningNumbers.includes(number) ? "lottery" : "outline"
                      }
                      className={`px-3 py-1 ${
                        winningNumbers.includes(number)
                          ? "ring-2 ring-offset-2 ring-green-100"
                          : ""
                      }`}
                    >
                      {number}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-md mt-4">
                <p className="text-sm font-medium text-green-700 mb-2">
                  Công thức tính tiền thắng:
                </p>
                <p className="text-sm text-green-600">
                  {winningNumbers.length} số trúng ×{" "}
                  {formatCurrency(bet.denomination)} ×
                  {typeof winRatio === "number"
                    ? ` tỷ lệ ${winRatio}`
                    : " tỷ lệ thưởng tương ứng"}{" "}
                  ={formatCurrency(bet.win_amount || 0)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <BetDetailAnalysis
                bet={bet}
                betType={betType}
                results={results}
              />
            </div>

            {/* Hiển thị kết quả xổ số liên quan */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Kết quả xổ số liên quan</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {results.special_prize &&
                      results.special_prize.length > 0 && (
                        <tr>
                          <td className="py-1 pr-2 font-medium text-gray-600">
                            Giải đặc biệt:
                          </td>
                          <td>{results.special_prize.join(", ")}</td>
                        </tr>
                      )}
                    {results.first_prize && results.first_prize.length > 0 && (
                      <tr>
                        <td className="py-1 pr-2 font-medium text-gray-600">
                          Giải nhất:
                        </td>
                        <td>{results.first_prize.join(", ")}</td>
                      </tr>
                    )}
                    {/* Thêm các giải khác nếu cần */}
                  </tbody>
                </table>
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
                <span className="text-gray-600">Loại cược:</span>
                <span>
                  {betType?.name || bet.bet_type}
                  {bet.bet_variant && ` (${bet.bet_variant})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mệnh giá:</span>
                <span>{formatCurrency(bet.denomination)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền đặt:</span>
                <span>{formatCurrency(bet.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền thắng:</span>
                <span>0 ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lỗ:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(bet.total_amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-3">Các số đã đánh</h4>
            <div className="flex flex-wrap gap-2">
              {bet.numbers.map((number, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {number}
                </Badge>
              ))}
            </div>
          </div>

          {/* Hiển thị kết quả xổ số liên quan */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Kết quả xổ số {province?.name}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {results.special_prize &&
                    results.special_prize.length > 0 && (
                      <tr>
                        <td className="py-1 pr-2 font-medium text-gray-600">
                          Giải đặc biệt:
                        </td>
                        <td>{results.special_prize.join(", ")}</td>
                      </tr>
                    )}
                  {results.first_prize && results.first_prize.length > 0 && (
                    <tr>
                      <td className="py-1 pr-2 font-medium text-gray-600">
                        Giải nhất:
                      </td>
                      <td>{results.first_prize.join(", ")}</td>
                    </tr>
                  )}
                  {/* Thêm các giải khác nếu cần */}
                </tbody>
              </table>
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
