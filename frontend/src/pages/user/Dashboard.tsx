import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Spinner } from "@/components/Spinner"
import { PageContainer } from "@/components/layout/PageContainer"
import { ProfileImageUpload } from "@/components/ProfileImageUpload"
import { Tutorial } from "@/pages/user/Tutorial"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const GRAVATAR_DEFAULT = "https://www.gravatar.com/avatar/?d=mp"

const CATEGORIES = [
  { name: "Music", link: "/dashboard/music" },
  { name: "Movies/TV", link: "/dashboard/movies" },
  { name: "Gaming", link: "/dashboard/gaming" },
] as const

const PROFILE_LINKS = [
  { label: "General Settings", to: "/settings?section=general" },
  { label: "Manage Profile", to: "/settings?section=manage-profile" },
  { label: "Manage API's", to: "/settings?section=manage-api" },
] as const

export function Dashboard() {
  const { user, authLoading } = useAuth()

  const [profileImage, setProfileImage] = useState(
    user?.profileImageUrl ?? GRAVATAR_DEFAULT,
  )
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Keep the profile image in sync when the auth user updates.
  useEffect(() => {
    if (user?.profileImageUrl) {
      setProfileImage(user.profileImageUrl)
    }
  }, [user])

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Gate: show tutorial until tutorialComplete is true.
  if (!user?.tutorialComplete) {
    return <Tutorial />
  }

  const handleUploadSuccess = (url: string) => {
    setProfileImage(url)
    setUploadDialogOpen(false)
  }

  return (
    <PageContainer title="Your Dashboard">
      {/* ── Profile card ─────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Avatar */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setUploadDialogOpen(true)}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Change profile picture"
              >
                <Avatar className="size-36 cursor-pointer ring-2 ring-border transition hover:ring-primary">
                  <AvatarImage
                    src={profileImage}
                    alt={user?.username ?? "Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <img
                      src={GRAVATAR_DEFAULT}
                      alt="Default avatar"
                      className="size-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>

            {/* User info + links */}
            <div className="flex flex-col justify-center gap-4">
              <p className="text-xl font-extrabold">
                Welcome{" "}
                <span className="text-primary">{user?.username}</span>
              </p>

              <div className="flex flex-col gap-1">
                {PROFILE_LINKS.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold transition-colors hover:underline"
                  >
                    {label}
                    <ChevronRight className="size-4 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Category cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {CATEGORIES.map(({ name, link }) => (
          <Link key={name} to={link}>
            <Card className="h-full transition hover:shadow-lg">
              <CardHeader>
                <CardTitle>{name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground">
                  Explore the latest trends and insights.
                </p>
                <Button variant="outline" className="w-fit">
                  Explore {name}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Profile image upload dialog ───────────────────────────── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
          </DialogHeader>
          <ProfileImageUpload onUploadSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

export default Dashboard
