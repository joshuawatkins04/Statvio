import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// NotFound is the catch-all 404 page.
export function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-primary text-7xl font-bold tracking-tight">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  )
}

export default NotFound
