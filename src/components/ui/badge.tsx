import React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          {
            "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300": variant === "default",
            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300": variant === "secondary",
            "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300": variant === "outline",
          },
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"