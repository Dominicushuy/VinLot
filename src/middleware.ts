// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Đơn giản hóa cho demo: Giả sử mọi người đều có quyền truy cập admin
  // Trong dự án thực tế, cần kiểm tra quyền từ session/token

  // Redirect từ homepage sang dashboard user
  if (path === "/") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
