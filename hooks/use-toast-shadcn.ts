"use client"

// This file re-exports the shadcn toast functionality
// It replaces the custom implementation with shadcn's built-in toast component

import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useShadcnToast,
} from "@/components/ui/use-toast"

// Re-export the types
export type { ToastProps, ToastActionElement }

// Re-export the hook with the same interface
export const useToast = useShadcnToast

// Re-export the toast function
export const { toast } = useShadcnToast()
