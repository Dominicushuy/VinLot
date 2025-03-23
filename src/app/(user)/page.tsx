// src/app/(user)/page.tsx
import Link from "next/link";
import { TrendingUp, TicketIcon, History } from "lucide-react";
import { Button } from "@/components/ui/button";

// Định nghĩa interface cho props của FeatureCard
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export default function Home() {
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

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureCard
              title="Đặt cược dễ dàng"
              description="Hỗ trợ đầy đủ các loại cược với giao diện thân thiện"
              icon={
                <TicketIcon className="h-10 w-10 text-lottery-primary p-2 bg-lottery-primary/10 rounded-xl" />
              }
              href="/bet"
            />

            {/* <FeatureCard
              title="Kết quả xổ số"
              description="Cập nhật kết quả nhanh chóng từ tất cả các đài"
              icon={
                <TrendingUp className="h-10 w-10 text-lottery-secondary p-2 bg-lottery-secondary/10 rounded-xl" />
              }
              href="/results"
            /> */}

            <FeatureCard
              title="Lịch sử cược"
              description="Theo dõi toàn bộ lịch sử cược và kết quả trúng thưởng"
              icon={
                <History className="h-10 w-10 text-green-600 p-2 bg-green-100 rounded-xl" />
              }
              href="/history"
            />

            {/* <FeatureCard
              title="Thống kê chuyên sâu"
              description="Phân tích xu hướng và tỷ lệ thắng/thua"
              icon={
                <BarChart3 className="h-10 w-10 text-purple-600 p-2 bg-purple-100 rounded-xl" />
              }
              href="/analytics"
            /> */}
          </div>
        </div>
      </section>

      {/* Rest of the code remains the same... */}
      {/* (Include the remaining sections from the original code) */}
    </div>
  );
}

// Component hỗ trợ với kiểu dữ liệu đã được định nghĩa
function FeatureCard({ title, description, icon, href }: FeatureCardProps) {
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
