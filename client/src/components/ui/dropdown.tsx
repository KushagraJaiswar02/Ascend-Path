import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
} | null>(null)

const Dropdown = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    if (!open) return
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  )
}

const DropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownContext)
  if (!context) throw new Error("DropdownTrigger must be used inside Dropdown")

  const combinedRef = (node: HTMLButtonElement | null) => {
    context.triggerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  return (
    <button
      ref={combinedRef}
      type="button"
      onClick={(e) => {
        context.setOpen(!context.open)
        onClick?.(e)
      }}
      className={cn("inline-flex items-center cursor-pointer select-none", className)}
      {...props}
    />
  )
})
DropdownTrigger.displayName = "DropdownTrigger"

const DropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { align?: "left" | "right" }
>(({ className, align = "right", ...props }, ref) => {
  const context = React.useContext(DropdownContext)
  if (!context) throw new Error("DropdownMenu must be used inside Dropdown")

  if (!context.open) return null

  // Also close dropdown menu when Esc is pressed
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        context.setOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [context])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-md border border-border bg-card p-1 text-card-foreground shadow-medium focus:outline-none",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
      {...props}
    />
  )
})
DropdownMenu.displayName = "DropdownMenu"

const DropdownItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(DropdownContext)
  if (!context) throw new Error("DropdownItem must be used inside Dropdown")

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        context.setOpen(false)
        onClick?.(e)
      }}
      className={cn(
        "flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
        className
      )}
      {...props}
    />
  )
})
DropdownItem.displayName = "DropdownItem"

export { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem }
