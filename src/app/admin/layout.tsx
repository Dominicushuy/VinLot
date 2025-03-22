// src/app/admin/layout.tsx
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="container mx-auto">{children}</div>
        </main>
        <footer className="bg-white border-t py-3 px-6 text-center text-sm text-gray-500">
          Hệ thống quản lý xổ số - Phiên bản Admin
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
