import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.ComponentProps<"div"> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between pb-md border-b border-border mb-lg",
          className
        )}
        {...props}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-heading-md font-bold tracking-tight text-foreground sm:text-heading-lg leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-xs text-body-sm text-muted-foreground leading-normal max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-xs sm:ml-md shrink-0">
            {actions}
          </div>
        )}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"
