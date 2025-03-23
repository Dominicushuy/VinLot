// src/lib/hooks/use-demo-mode.ts
import { useState, useEffect } from "react";

/**
 * Hook để xác định ứng dụng có đang chạy ở chế độ demo hay không
 * @returns Object { isDemo: boolean, isLoading: boolean }
 */
export function useDemoMode() {
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Kiểm tra biến môi trường
    const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    setIsDemo(demoMode);
    setIsLoading(false);
  }, []);

  return { isDemo, isLoading };
}
