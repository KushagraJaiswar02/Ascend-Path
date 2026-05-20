import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps extends React.ComponentProps<"div"> {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-xs sm:flex-row sm:items-center sm:justify-between mb-md mt-lg",
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-heading-xs font-semibold tracking-tight text-foreground sm:text-heading-sm leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-body-xs text-muted-foreground leading-normal">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-xs sm:ml-sm shrink-0">
            {actions}
          </div>
        )}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"
