"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TicketIcon,
  BarChart3,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile sidebar when path changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const navItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Đặt cược",
      href: "/bet",
      icon: <TicketIcon size={20} />,
    },
    {
      name: "Kết quả xổ số",
      href: "/results",
      icon: <TrendingUp size={20} />,
    },
    {
      name: "Lịch sử cược",
      href: "/history",
      icon: <History size={20} />,
    },
    {
      name: "Thống kê",
      href: "/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Quản trị",
      href: "/admin",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 h-9 w-9"
        onClick={toggleSidebar}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-screen bg-white border-r border-gray-200 z-40",
          isMobile
            ? "fixed left-0 top-0 w-64 transition-transform duration-300 ease-in-out transform"
            : "sticky top-0 transition-all duration-300 ease-in-out",
          isMobile && !mobileOpen ? "-translate-x-full" : "",
          !isMobile && collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/" className="flex items-center">
            {collapsed && !isMobile ? (
              <div className="w-8 h-8 bg-lottery-primary rounded-md flex items-center justify-center text-white font-bold">
                X
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-lottery-primary rounded-md flex items-center justify-center text-white font-bold mr-2">
                  X
                </div>
                <span className="text-lg font-semibold text-lottery-primary">
                  Quản lý Xổ số
                </span>
              </div>
            )}
          </Link>
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-8 w-8"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md group transition-colors",
                    pathname === item.href
                      ? "bg-lottery-primary text-white"
                      : "text-gray-700 hover:bg-lottery-primary/10"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(!collapsed || isMobile) && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <div
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
            )}
          >
            <LogOut size={20} />
            {(!collapsed || isMobile) && (
              <span className="ml-3 font-medium">Đăng xuất</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
