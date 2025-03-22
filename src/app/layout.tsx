// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quản lý cá cược xổ số | Hệ thống quản lý toàn diện",
  description:
    "Hệ thống quản lý cá cược xổ số với các tính năng hiện đại, đầy đủ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-x-hidden">
              <Header />
              <main className="container mx-auto p-4 lg:p-6">{children}</main>
            </div>
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
