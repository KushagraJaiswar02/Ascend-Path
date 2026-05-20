import * as React from "react"
import { cn } from "@/lib/utils"

export interface SidebarLayoutProps extends React.ComponentProps<"div"> {
  sidebar: React.ReactNode
  children: React.ReactNode
  reverse?: boolean
}

export const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  ({ className, sidebar, children, reverse = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-md lg:flex-row lg:gap-lg",
          reverse && "lg:flex-row-reverse",
          className
        )}
        {...props}
      >
        <aside className="w-full lg:w-64 xl:w-72 shrink-0">
          <div className="sticky top-20 flex flex-col gap-md">
            {sidebar}
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    )
  }
)
SidebarLayout.displayName = "SidebarLayout"
