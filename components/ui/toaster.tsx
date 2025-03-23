"use client"

import { useToast } from "@/components/ui/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive";
        return (
          <Toast 
            key={id} 
            variant={variant} 
            {...props} 
            className={isDestructive 
              ? "border-2 border-destructive shadow-lg" 
              : ""}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className={isDestructive ? "text-base font-bold" : ""}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription 
                  className={isDestructive ? "opacity-100 text-sm font-medium" : ""}
                >
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="sm:bottom-4 sm:right-4 z-50 max-w-[420px]" />
    </ToastProvider>
  )
}
