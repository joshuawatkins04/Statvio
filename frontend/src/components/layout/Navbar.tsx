import { Link } from "react-router-dom"
import { LayoutDashboard, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const GRAVATAR_FALLBACK = "https://www.gravatar.com/avatar/?d=mp"

// Navbar is the fixed top navigation: brand on the left; theme toggle plus
// either auth buttons (logged out) or an account dropdown (logged in) on the
// right.
export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-background/80 fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b px-6 py-3 backdrop-blur">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        Statvio
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {!user ? (
          <>
            <Button variant="outline" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Account menu"
              >
                <Avatar className="size-9">
                  <AvatarImage
                    src={user.profileImageUrl || GRAVATAR_FALLBACK}
                    alt={user.username}
                  />
                  <AvatarFallback>
                    {user.username?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="truncate">
                {user.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}

export default Navbar
