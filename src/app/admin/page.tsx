// src/app/admin/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  CreditCard,
  ListTodo,
  Award,
  Calendar,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng cược tháng này"
          value="36,840,000₫"
          change="+12.5%"
          trend="up"
          icon={<CreditCard className="h-6 w-6" />}
        />
        <StatsCard
          title="Người chơi hoạt động"
          value="245"
          change="+3.2%"
          trend="up"
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          title="Phiếu trúng thưởng"
          value="1,842"
          change="-5.1%"
          trend="down"
          icon={<Award className="h-6 w-6" />}
        />
        <StatsCard
          title="Tỷ lệ Win/Loss"
          value="22.3%"
          change="+0.8%"
          trend="up"
          icon={<BarChart className="h-6 w-6" />}
        />
      </div>

      {/* Activity and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thống kê cược theo ngày</CardTitle>
            <CardDescription>
              Số lượng cược và tỷ lệ thắng/thua 30 ngày qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart */}
            <div className="h-80 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Chart visualization placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhiệm vụ hệ thống</CardTitle>
            <CardDescription>Các tác vụ cần xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <Ticket className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">
                        24 phiếu chờ đối soát
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Có phiếu từ ngày 21/03 đến 22/03
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link href="/admin/process-results">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      Xử lý ngay
                    </Button>
                  </Link>
                </div>
              </div>

              <TaskItem
                icon={<Calendar className="h-5 w-5 text-blue-600" />}
                title="Cập nhật kết quả xổ số"
                description="Kết quả ngày 22/03 đã sẵn sàng"
                href="/admin/results"
              />

              <TaskItem
                icon={<ListTodo className="h-5 w-5 text-purple-600" />}
                title="Đồng bộ tỷ lệ cược"
                description="Cập nhật tỷ lệ cược cho Xiên 3, Xiên 4"
                href="/admin/bet-types"
              />

              <TaskItem
                icon={<Users className="h-5 w-5 text-green-600" />}
                title="Người dùng mới"
                description="8 người dùng đăng ký trong tuần này"
                href="/admin/users"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

function StatsCard({ title, value, change, trend, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="bg-gray-100 p-2 rounded-lg">{icon}</span>
          <span
            className={cn(
              "text-sm font-medium flex items-center",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {change}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function TaskItem({ icon, title, description, href }: TaskItemProps) {
  return (
    <div className="border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className="mt-0.5 mr-2 flex-shrink-0">{icon}</div>
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Link href={href}>
          <Button size="sm" variant="outline" className="w-full">
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </div>
  );
}
