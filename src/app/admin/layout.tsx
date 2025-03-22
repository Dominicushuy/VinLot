// src/app/admin/layout.tsx
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
        <footer className="bg-white border-t py-3 px-6 text-center text-sm text-gray-500">
          Hệ thống quản lý xổ số - Admin Panel © 2025
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
