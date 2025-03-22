// src/components/admin/header.tsx
"use client";

import { User, Bell, Search, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const pathname = usePathname();

  // Xác định tiêu đề trang dựa trên pathname
  const getPageTitle = () => {
    switch (true) {
      case pathname === "/admin":
        return "Admin Dashboard";
      case pathname === "/admin/bet-types":
        return "Quản lý loại cược";
      case pathname === "/admin/provinces":
        return "Quản lý đài xổ số";
      case pathname === "/admin/results":
        return "Quản lý kết quả xổ số";
      case pathname === "/admin/process-results":
        return "Đối soát kết quả";
      case pathname === "/admin/advanced-process":
        return "Đối soát nâng cao";
      default:
        return "Quản trị hệ thống";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
        {pathname === "/admin/process-results" && (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-800 border-amber-200"
          >
            {Math.floor(Math.random() * 50) + 10} phiếu chờ đối soát
          </Badge>
        )}
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

        {/* System stats */}
        <Button size="sm" variant="outline" className="flex items-center">
          <BarChart size={16} className="mr-2" />
          <span className="hidden md:inline">Thống kê hệ thống</span>
        </Button>

        {/* Notification */}
        <Button size="sm" variant="ghost" className="relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            2
          </span>
        </Button>

        {/* Admin info */}
        <Button size="sm" variant="outline" className="flex items-center">
          <User size={16} className="mr-2" />
          <span className="hidden md:inline">Admin</span>
        </Button>
      </div>
    </header>
  );
}
