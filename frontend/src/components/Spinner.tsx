import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Spinner is a small, centered loading indicator using the design-system
// primary color.
export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className={cn("text-primary size-10 animate-spin", className)} />
    </div>
  )
}

export default Spinner
