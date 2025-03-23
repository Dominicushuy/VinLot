// Simplified toast component for the example
// In a full implementation, you would use a more robust toast library like sonner or react-hot-toast

import { useState, useEffect } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "lottery" | "secondary" | "outline";
  duration?: number;
};

type ToastState = ToastProps & {
  id: string;
  open: boolean;
};

let toastCounter = 0;

const toasts: ToastState[] = [];
const toastListeners: Set<(toasts: ToastState[]) => void> = new Set();

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function toast(props: ToastProps) {
  const id = String(++toastCounter);
  const newToast: ToastState = {
    id,
    title: props.title,
    description: props.description,
    variant: props.variant || "default",
    duration: props.duration || 5000,
    open: true,
  };

  toasts.push(newToast);
  notifyListeners();

  // Auto-dismiss toast after duration
  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  }, newToast.duration);

  return {
    id,
    dismiss: () => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        toasts.splice(index, 1);
        notifyListeners();
      }
    },
    update: (props: Partial<ToastProps>) => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        toasts[index] = { ...toasts[index], ...props };
        notifyListeners();
      }
    },
  };
}

// Hook for components to use toasts
export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const handleToastsChange = (newToasts: ToastState[]) => {
      setCurrentToasts(newToasts);
    };

    toastListeners.add(handleToastsChange);
    return () => {
      toastListeners.delete(handleToastsChange);
    };
  }, []);

  return {
    toast,
    toasts: currentToasts,
    dismiss: (id: string) => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        toasts.splice(index, 1);
        notifyListeners();
      }
    },
  };
}
