import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  /** Optional function to map a stored value (id) to a display string */
  getDisplayValue?: (value: string) => string
  children: React.ReactNode
}

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  getDisplayValue?: (value: string) => string
  // bounding rect of the trigger used to position the dropdown as fixed
  anchorRect?: DOMRect | null
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

const Select = ({ value, onValueChange, children, getDisplayValue }: SelectProps) => {
  const [open, setOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // compute and keep anchor rect when opening and on resize/scroll
  React.useEffect(() => {
    const updateRect = () => {
      if (selectRef.current) {
        setAnchorRect(selectRef.current.getBoundingClientRect())
      }
    }

    if (open) {
      updateRect()
      window.addEventListener('resize', updateRect)
      window.addEventListener('scroll', updateRect, true)
    }

    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, getDisplayValue, anchorRect }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => context.setOpen(!context.open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")

  // Map values to display text
  const getDisplayText = (value: string) => {
    // Allow parent to provide a custom mapping first
    if (context.getDisplayValue) return context.getDisplayValue(value)
    if (value === 'male') return 'Erkek'
    if (value === 'female') return 'Kız'
    return value
  }

  return (
    <span className={cn("text-gray-900", !context.value && "text-gray-500")}>
      {context.value ? getDisplayText(context.value) : placeholder}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

interface SelectContentProps {
  children: React.ReactNode
}

const SelectContent = ({ children }: SelectContentProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")
  if (!context.open) return null

  const rect = context.anchorRect

  // If we have an anchorRect, position dropdown fixed to avoid affecting page flow/scroll.
  if (rect) {
    const style: React.CSSProperties = {
      position: 'fixed',
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      zIndex: 9999,
      marginTop: 4,
    }

    return (
      <div style={style} className="min-w-[8rem] rounded-md border bg-white shadow-md">
        {children}
      </div>
    )
  }

  return (
    <div className="absolute top-full left-0 z-50 w-full mt-1 min-w-[8rem] rounded-md border bg-white shadow-md">
      {children}
    </div>
  )
}
SelectContent.displayName = "SelectContent"

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

const SelectItem = ({ value, children }: SelectItemProps) => {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  const handleClick = () => {
    context.onValueChange?.(value)
    context.setOpen(false)
  }

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center py-2 px-3 text-sm",
        "hover:bg-gray-100 focus:bg-gray-100",
        context.value === value && "bg-blue-50 text-blue-900"
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
SelectItem.displayName = "SelectItem"

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
}