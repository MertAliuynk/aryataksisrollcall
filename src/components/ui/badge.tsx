import * as React from "react"
import { cn } from "../../lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    
    const variantClasses = {
      default: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
      destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-200 text-gray-900 hover:bg-gray-100",
      success: "border-transparent bg-green-500 text-white hover:bg-green-600"
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }