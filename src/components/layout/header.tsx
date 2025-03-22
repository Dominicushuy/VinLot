// src/components/layout/header.tsx
"use client";

import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

// Demo user data - thay thế bằng dữ liệu thực từ authentication trong dự án thực tế
const demoUser = {
  name: "Nguyễn Văn A",
  balance: 10000000,
};

export function Header() {
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
      case pathname.startsWith("/admin"):
        return "Quản trị hệ thống";
      default:
        return "Quản lý cá cược xổ số";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center">
          <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center">
            <span className="mr-1">Số dư:</span>
            <span className="font-medium">
              {formatCurrency(demoUser.balance)}
            </span>
          </div>
        </div>

        <Button size="sm" variant="ghost" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </Button>

        <Button size="sm" variant="outline" className="flex items-center">
          <User size={16} className="mr-2" />
          <span className="hidden sm:inline">{demoUser.name}</span>
        </Button>
      </div>
    </header>
  );
}
