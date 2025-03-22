// src/components/user/header.tsx
"use client";

import { User, Bell, Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo user data
const demoUser = {
  name: "Nguyễn Văn A",
  balance: 10000000,
};

export function UserHeader() {
  const pathname = usePathname();

  // Xác định tiêu đề trang dựa trên pathname
  const getPageTitle = () => {
    switch (true) {
      case pathname === "/":
        return "Trang chủ";
      case pathname === "/bet":
        return "Đặt cược";
      case pathname === "/results":
        return "Kết quả xổ số";
      case pathname === "/history":
        return "Lịch sử cược";
      case pathname.startsWith("/history/"):
        return "Chi tiết cược";
      case pathname === "/analytics":
        return "Thống kê";
      default:
        return "Xổ số Online";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
        {getPageTitle()}
      </h1>

      <div className="flex items-center md:hidden">
        <h1 className="text-lg font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-lottery-primary focus:border-lottery-primary w-56"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Balance */}
        <div className="hidden md:flex items-center">
          <Button
            variant="outline"
            className={cn(
              "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 flex items-center font-medium"
            )}
          >
            <DollarSign size={16} className="mr-1" />
            {formatCurrency(demoUser.balance)}
          </Button>
        </div>

        {/* Notification */}
        <Button size="sm" variant="ghost" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <div className="hidden md:block">
          <Button size="sm" variant="outline" className="flex items-center">
            <User size={16} className="mr-2" />
            <span>{demoUser.name}</span>
          </Button>
        </div>

        {/* Deposit button */}
        <div>
          <Link href="/deposit">
            <Button size="sm" variant="lottery">
              <span className="hidden md:inline mr-1">Nạp tiền</span>
              <span className="md:hidden">+</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
