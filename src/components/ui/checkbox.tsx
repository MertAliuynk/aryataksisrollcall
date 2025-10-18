import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    return (
      <div className="relative">
        <input
          type="checkbox"
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "checked:bg-blue-500 checked:border-blue-500",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        <Check 
          className={cn(
            "absolute left-0 top-0 h-4 w-4 text-white pointer-events-none",
            "opacity-0 peer-checked:opacity-100"
          )} 
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }