// app/(user)/page.tsx
import Link from "next/link";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  TicketIcon,
  History,
  HelpCircle,
  ArrowRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  // Dữ liệu mẫu cho kết quả xổ số mới nhất
  const latestResults = [
    {
      province: "TP. HCM",
      date: "22/03/2025",
      special: "957832",
      first: "81927",
    },
    {
      province: "Đồng Tháp",
      date: "22/03/2025",
      special: "483921",
      first: "23458",
    },
    {
      province: "Hà Nội",
      date: "21/03/2025",
      special: "273584",
      first: "94721",
    },
  ];

  // Dữ liệu mẫu cho lịch mở thưởng sắp tới
  const upcomingDraws = [
    { province: "TP. HCM", date: "24/03/2025", day: "Thứ hai" },
    { province: "Đồng Nai", date: "25/03/2025", day: "Thứ ba" },
    { province: "Cần Thơ", date: "26/03/2025", day: "Thứ tư" },
  ];

  // Dữ liệu mẫu cho các loại cược phổ biến
  const popularBets = [
    {
      name: "Đầu Đuôi",
      ratio: "1:75",
      description: "Cược dựa trên 2 chữ số (00-99)",
    },
    {
      name: "Bao Lô 2",
      ratio: "1:75",
      description: "Cược 2 số cuối của bất kỳ lô nào",
    },
    {
      name: "Xỉu Chủ",
      ratio: "1:650",
      description: "Cược dựa trên 3 chữ số (000-999)",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-lottery-primary to-lottery-secondary py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hệ thống quản lý cá cược xổ số hiện đại
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Đặt cược dễ dàng với đầy đủ các loại cược, xem kết quả real-time
              và theo dõi lịch sử cược trong một giao diện thuận tiện.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/bet">
                <Button
                  size="lg"
                  className="bg-white text-lottery-primary hover:bg-gray-100"
                >
                  <TicketIcon className="mr-2 h-5 w-5" />
                  Đặt cược ngay
                </Button>
              </Link>
              <Link href="/results">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Xem kết quả
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative patterns */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
          <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full bg-white/20"></div>
          <div className="absolute right-32 bottom-1/4 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute right-64 top-1/2 w-20 h-20 rounded-full bg-white/15"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tính năng nổi bật
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              title="Đặt cược dễ dàng"
              description="Hỗ trợ đầy đủ các loại cược với giao diện thân thiện"
              icon={
                <TicketIcon className="h-10 w-10 text-lottery-primary p-2 bg-lottery-primary/10 rounded-xl" />
              }
              href="/bet"
            />

            <FeatureCard
              title="Kết quả xổ số"
              description="Cập nhật kết quả nhanh chóng từ tất cả các đài"
              icon={
                <TrendingUp className="h-10 w-10 text-lottery-secondary p-2 bg-lottery-secondary/10 rounded-xl" />
              }
              href="/results"
            />

            <FeatureCard
              title="Lịch sử cược"
              description="Theo dõi toàn bộ lịch sử cược và kết quả trúng thưởng"
              icon={
                <History className="h-10 w-10 text-green-600 p-2 bg-green-100 rounded-xl" />
              }
              href="/history"
            />

            <FeatureCard
              title="Thống kê chuyên sâu"
              description="Phân tích xu hướng và tỷ lệ thắng/thua"
              icon={
                <BarChart3 className="h-10 w-10 text-purple-600 p-2 bg-purple-100 rounded-xl" />
              }
              href="/analytics"
            />
          </div>
        </div>
      </section>

      {/* Latest Results and Upcoming Draws */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Latest Results */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl flex items-center">
                    <Award className="mr-2 h-5 w-5 text-lottery-primary" />
                    Kết quả gần đây
                  </CardTitle>
                  <Link href="/results">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lottery-primary"
                    >
                      Xem tất cả
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Kết quả xổ số mới nhất từ các đài
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {latestResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{result.province}</h3>
                          <span className="text-sm text-gray-500">
                            {result.date}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-gray-50">
                          Mới nhất
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            Giải đặc biệt
                          </div>
                          <div className="text-lg font-bold text-lottery-primary">
                            {result.special}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            Giải nhất
                          </div>
                          <div className="text-lg font-bold">
                            {result.first}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Draws */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-lottery-secondary" />
                    Lịch mở thưởng
                  </CardTitle>
                  <Link href="/calendar">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-lottery-secondary"
                    >
                      Xem lịch đầy đủ
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Lịch mở thưởng sắp tới các tỉnh/thành phố
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDraws.map((draw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center">
                        <div className="bg-lottery-secondary/10 text-lottery-secondary rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          {draw.date.split("/")[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold">{draw.province}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {draw.day} ({draw.date})
                          </div>
                        </div>
                      </div>
                      <Link href={`/bet?province=${draw.province}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-lottery-secondary text-lottery-secondary hover:bg-lottery-secondary/10"
                        >
                          Đặt cược
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/bet">
                    <Button className="w-full bg-lottery-secondary hover:bg-lottery-secondary/90">
                      <TicketIcon className="mr-2 h-4 w-4" />
                      Đặt cược ngay
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Bet Types */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Loại cược phổ biến
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Hệ thống hỗ trợ đầy đủ các loại cược từ cơ bản đến nâng cao với tỷ
            lệ thưởng hấp dẫn
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {popularBets.map((bet, idx) => (
              <Card
                key={idx}
                className="hover:shadow-md transition-all border-t-4 border-lottery-primary"
              >
                <CardHeader>
                  <CardTitle>{bet.name}</CardTitle>
                  <Badge className="w-fit mt-1 bg-lottery-primary">
                    {bet.ratio}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{bet.description}</p>
                  <Link
                    href="/bet"
                    className="inline-block mt-4 text-lottery-primary font-medium hover:underline"
                  >
                    Tìm hiểu thêm
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/bet">
              <Button
                variant="outline"
                size="lg"
                className="border-lottery-primary text-lottery-primary hover:bg-lottery-primary/10"
              >
                Xem tất cả loại cược
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Started / CTA */}
      <section className="py-16 bg-gradient-to-r from-lottery-primary/10 to-lottery-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Bắt đầu ngay hôm nay</h2>
          <p className="mb-8 max-w-2xl mx-auto text-gray-600">
            Trải nghiệm hệ thống quản lý cá cược xổ số hiện đại với đầy đủ tính
            năng và giao diện dễ sử dụng. Theo dõi kết quả và quản lý cược chỉ
            trong vài thao tác.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/bet">
              <Button
                size="lg"
                className="bg-lottery-primary hover:bg-lottery-primary/90"
              >
                <TicketIcon className="mr-2 h-5 w-5" />
                Đặt cược ngay
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline">
                <HelpCircle className="mr-2 h-5 w-5" />
                Hướng dẫn sử dụng
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Component hỗ trợ
function FeatureCard({ title, description, icon, href }) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
