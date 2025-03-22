import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "lottery";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 max-w-md rounded-md shadow-lg p-4 bg-white border border-gray-200 transition-opacity duration-300",
          variant === "destructive" && "bg-red-600 text-white border-red-600",
          variant === "lottery" &&
            "bg-lottery-primary text-white border-lottery-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

export { Toast };
