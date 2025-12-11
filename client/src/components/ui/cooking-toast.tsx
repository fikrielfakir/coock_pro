import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Award } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "achievement";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const toastListeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function showToast(toast: Omit<Toast, "id">): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  toasts.push({ ...toast, id });
  notifyListeners();
  
  const duration = toast.duration ?? (toast.type === "achievement" ? 5000 : 3000);
  setTimeout(() => {
    dismissToast(id);
  }, duration);
  
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
}

export function showSuccess(title: string, message?: string): string {
  return showToast({ type: "success", title, message });
}

export function showError(title: string, message?: string): string {
  return showToast({ type: "error", title, message, duration: 4000 });
}

export function showInfo(title: string, message?: string): string {
  return showToast({ type: "info", title, message });
}

export function showAchievement(title: string, message?: string): string {
  return showToast({ type: "achievement", title, message, duration: 5000 });
}

const toastConfig: Record<ToastType, { 
  icon: React.ReactNode; 
  bgColor: string; 
  borderColor: string;
  iconColor: string;
}> = {
  success: {
    icon: <CheckCircle size={22} />,
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    iconColor: "text-green-600"
  },
  error: {
    icon: <AlertCircle size={22} />,
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    iconColor: "text-red-600"
  },
  info: {
    icon: <Info size={22} />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    iconColor: "text-blue-600"
  },
  achievement: {
    icon: <Award size={22} />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
    iconColor: "text-amber-600"
  }
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = toastConfig[toast.type];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        ${config.bgColor} ${config.borderColor}
        border-l-4 rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]
        flex items-start gap-3 pointer-events-auto
      `}
    >
      <div className={config.iconColor}>
        {config.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-gray-800 text-sm">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="font-body text-gray-600 text-xs mt-0.5">
            {toast.message}
          </p>
        )}
      </div>
      
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts(newToasts);
    };
    
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {currentToasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showAchievement,
    dismiss: dismissToast
  };
}
