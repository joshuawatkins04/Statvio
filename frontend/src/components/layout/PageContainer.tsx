import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  title?: string
  children: ReactNode
  /** Vertically centre the content (used for short pages like settings forms). */
  center?: boolean
  className?: string
}

// PageContainer is the standard authenticated-page wrapper. It accounts for the
// fixed navbar height, constrains content width, and optionally renders a
// centered page title — the shadcn-era replacement for the old DefaultLayout.
export function PageContainer({
  title,
  children,
  center = false,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "min-h-svh px-4 pt-24 pb-12 sm:px-6 lg:px-8",
        center && "flex items-center",
      )}
    >
      <div className={cn("mx-auto w-full max-w-5xl", className)}>
        {title && (
          <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  )
}

export default PageContainer
