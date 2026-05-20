import * as React from "react"
import { cn } from "@/lib/utils"

export interface ContentGridProps extends React.ComponentProps<"div"> {
  columns?: 1 | 2 | 3 | 4 | "auto-fit"
}

export const ContentGrid = React.forwardRef<HTMLDivElement, ContentGridProps>(
  ({ className, columns = "auto-fit", ...props }, ref) => {
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      "auto-fit": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-md sm:gap-lg",
          typeof columns === "number" ? colClasses[columns] : colClasses["auto-fit"],
          className
        )}
        {...props}
      />
    )
  }
)
ContentGrid.displayName = "ContentGrid"
