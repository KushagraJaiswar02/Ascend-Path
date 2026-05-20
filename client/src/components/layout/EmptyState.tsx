import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center p-lg border border-dashed border-border rounded-lg bg-card text-card-foreground shadow-subtle min-h-[300px]",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="p-sm bg-muted text-muted-foreground rounded-full mb-md">
            <Icon className="h-8 w-8 shrink-0 animate-pulse" />
          </div>
        )}
        <h3 className="text-body-lg font-bold text-foreground mb-sm">{title}</h3>
        <p className="text-body-sm text-muted-foreground max-w-sm mb-lg leading-normal">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} variant="primary" size="md">
            {action.label}
          </Button>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"
