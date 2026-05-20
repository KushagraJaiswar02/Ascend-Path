import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.ComponentProps<"div"> {
  size?: "default" | "tight" | "wide" | "full"
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "max-w-7xl",
      tight: "max-w-4xl",
      wide: "max-w-[90rem]",
      full: "max-w-full",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8 py-md sm:py-lg md:py-xl",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
PageContainer.displayName = "PageContainer"
