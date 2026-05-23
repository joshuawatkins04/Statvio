import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { connectToSpotify, unlinkSpotify } from "@/lib/api/spotify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceRow {
  name: string
  comingSoon?: boolean
}

const SERVICES: ServiceRow[] = [
  { name: "Spotify" },
  { name: "SoundCloud", comingSoon: true },
]

export function ManageApis() {
  const { user, updateApiInfo } = useAuth()
  const [linked, setLinked] = useState<string[]>(user?.apisLinked ?? [])
  const [apiCount, setApiCount] = useState<number>(user?.apiCount ?? 0)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  useEffect(() => {
    updateApiInfo()
      .then(({ apiCount: count, apisLinked }) => {
        setApiCount(count ?? 0)
        setLinked(apisLinked ?? [])
      })
      .catch(() => {
        // Silently fall back to cached user data on load errors.
      })
  }, [updateApiInfo])

  const handleConnect = (name: string) => {
    if (name === "Spotify") {
      connectToSpotify()
    }
  }

  const handleUnlink = async (name: string) => {
    setUnlinking(name)
    try {
      if (name === "Spotify") {
        await unlinkSpotify()
      }
      toast.success(`${name} unlinked successfully.`)
      const { apiCount: count, apisLinked } = await updateApiInfo()
      setApiCount(count ?? 0)
      setLinked(apisLinked ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to unlink ${name}.`)
    } finally {
      setUnlinking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Manage APIs</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here you can manage the APIs linked to your account.
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          APIs linked:{" "}
          <span className="text-foreground font-medium">{apiCount}</span>
        </p>
      </div>

      <div className="grid gap-4">
        {SERVICES.map(({ name, comingSoon }) => {
          const isLinked = linked.includes(name)
          const isUnlinking = unlinking === name

          return (
            <Card key={name}>
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{name}</span>
                  {comingSoon && (
                    <Badge variant="secondary">Coming soon</Badge>
                  )}
                  {isLinked && (
                    <Badge variant="default">Linked</Badge>
                  )}
                </div>

                {!comingSoon && (
                  <div className="flex gap-3">
                    {!isLinked && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleConnect(name)}
                      >
                        Link
                      </Button>
                    )}
                    {isLinked && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={isUnlinking}
                        onClick={() => handleUnlink(name)}
                      >
                        {isUnlinking ? "Unlinking…" : "Unlink"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ManageApis
