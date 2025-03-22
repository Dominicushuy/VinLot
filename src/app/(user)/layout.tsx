// src/app/(user)/layout.tsx
import { UserSidebar } from "@/components/user/sidebar";
import { UserHeader } from "@/components/user/header";
import { Toaster } from "@/components/ui/toaster";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
