"use client";

import { useToast } from "@/components/ui/use-toast";
import { Toast } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant as "default" | "destructive" | "lottery"}
          className="animate-in slide-in-from-right-full"
        >
          <div className="flex flex-col gap-1">
            {toast.title && <div className="font-medium">{toast.title}</div>}
            {toast.description && (
              <div className="text-sm">{toast.description}</div>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute top-2 right-2 h-4 w-4 text-gray-500 hover:text-gray-900"
          >
            ×
          </button>
        </Toast>
      ))}
    </>
  );
}
