import * as React from "react"
import { cn } from "@/lib/utils"

const AvatarContext = React.createContext<{ hasError: boolean; setHasError: (val: boolean) => void }>({
  hasError: true,
  setHasError: () => {},
})

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(true)
  return (
    <AvatarContext.Provider value={{ hasError, setHasError }}>
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted text-muted-foreground select-none border border-border",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<"img">
>(({ className, src, alt, onError, onLoad, ...props }, ref) => {
  const { setHasError } = React.useContext(AvatarContext)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)
    setHasError(true)
  }, [src, setHasError])

  if (failed || !src) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        setHasError(false)
        onLoad?.(e)
      }}
      onError={(e) => {
        setFailed(true)
        setHasError(true)
        onError?.(e)
      }}
      className={cn("absolute inset-0 aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { hasError } = React.useContext(AvatarContext)

  if (!hasError) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted font-bold text-muted-foreground text-sm uppercase select-none",
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

