import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";

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
          <main className="min-h-screen flex flex-col">
            {/* Header sẽ được phát triển sau */}
            <div className="flex-grow">{children}</div>
            {/* Footer sẽ được phát triển sau */}
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}
