// src/components/admin/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  Map,
  Award,
  CheckSquare,
  Settings,
  Users,
  FileText,
  LogOut,
  Database,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Định nghĩa các mục menu
const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Loại cược",
    href: "/admin/bet-types",
    icon: <ListTodo className="h-5 w-5" />,
  },
  {
    title: "Đài xổ số",
    href: "/admin/provinces",
    icon: <Map className="h-5 w-5" />,
  },
  {
    title: "Kết quả xổ số",
    href: "/admin/results",
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: "Đối soát kết quả",
    href: "/admin/process-results",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Báo cáo tài chính",
    href: "/admin/reports",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Cấu hình hệ thống",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Crawler Logs",
    href: "/admin/crawler-logs",
    icon: <Database className="h-5 w-5" />,
  },
  // {
  //   title: "Công cụ đối soát nâng cao",
  //   href: "/admin/advanced-process",
  //   icon: <AlertTriangle className="h-5 w-5" />,
  //   highlight: true,
  // },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-lottery-primary rounded-md flex items-center justify-center text-white font-bold">
            X
          </div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        {/* User Mode Button - NEW */}
        <Link href="/">
          <Button
            size="sm"
            variant="outline"
            className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="text-xs">User</span>
          </Button>
        </Link>
      </div>

      <nav className="mt-4">
        <div className="px-4 py-2 text-xs uppercase font-semibold text-gray-400">
          Quản lý chính
        </div>
        <ul>
          {menuItems.slice(0, 5).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors",
                  pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "bg-gray-800 border-l-4 border-lottery-primary"
                    : ""
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* <div className="px-4 py-2 mt-6 text-xs uppercase font-semibold text-gray-400">
          Cài đặt & Báo cáo
        </div>
        <ul>
          {menuItems.slice(5).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors",
                  pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href))
                    ? "bg-gray-800 border-l-4 border-lottery-primary"
                    : ""
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul> */}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button className="flex items-center text-gray-300 hover:text-white w-full">
          <LogOut className="h-5 w-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
