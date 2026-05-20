import * as React from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastContextProps {
  toasts: Toast[]
  toast: (options: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextProps | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ duration = 5000, ...options }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, duration, ...options }
    
    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const ToastContainer = () => {
  const context = React.useContext(ToastContext)
  if (!context || context.toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-55 flex flex-col gap-xs w-full max-w-sm p-4">
      {context.toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={context.dismiss} />
      ))}
    </div>,
    document.body
  )
}

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) => {
  const { id, title, description, type = "info" } = toast

  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-success shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-destructive shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  }

  const borderClass = {
    success: "border-success/30 bg-card text-foreground",
    error: "border-destructive/30 bg-card text-foreground",
    warning: "border-warning/30 bg-card text-foreground",
    info: "border-border bg-card text-foreground",
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex w-full items-start gap-xs rounded-lg border p-4 shadow-medium bg-card text-card-foreground animate-in slide-in-from-bottom-5 duration-200",
        borderClass[type]
      )}
    >
      {iconMap[type]}
      <div className="flex-1 flex flex-col gap-1">
        <h5 className="text-sm font-semibold leading-none">{title}</h5>
        {description && <p className="text-xs text-muted-foreground leading-normal">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-muted-foreground hover:text-foreground rounded-md opacity-70 hover:opacity-100 transition-opacity p-0.5 cursor-pointer select-none"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
