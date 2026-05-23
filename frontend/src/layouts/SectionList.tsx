import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import spotifyLogo from "@/assets/Primary_Logo_Black_CMYK.svg"

function timeAgo(isoTimestamp: string): string {
  const now = new Date()
  const past = new Date(isoTimestamp)
  const diffMs = now.getTime() - past.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  if (seconds > 0) return `${seconds} second${seconds > 1 ? "s" : ""} ago`
  return "just now"
}

export interface SectionListItem {
  id?: string | number
  name: string
  image_url?: string
  track_url?: string
  artist_url?: string
  artist?: string
  played_at?: string
}

interface SectionListProps {
  title: string
  items: SectionListItem[]
  tutorial?: boolean
}

export function SectionList({ title, items, tutorial }: SectionListProps) {
  const [showAll, setShowAll] = useState(false)

  const visibleItems = showAll ? items : items.slice(0, 10)

  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
        </div>
        <div className="mt-4 border-t" />
      </CardHeader>

      <CardContent className="pt-4">
        <ul className="space-y-2">
          {visibleItems.map((item, index) => (
            <li
              key={`${item.id ?? "no-id"}-${index}`}
              className="flex min-h-[70px] items-start rounded-md p-2 hover:bg-muted"
            >
              <div className="flex w-24 flex-shrink-0 items-center sm:w-28">
                <span className="w-8 text-center font-bold">{index + 1}.</span>
                <a href={item.track_url ?? "#"} target="_blank" rel="noopener noreferrer">
                  <img
                    src={item.image_url ?? "https://placehold.co/48x48"}
                    alt={item.name}
                    className="ml-2 h-12 w-12 rounded-md object-cover"
                  />
                </a>
              </div>

              <div className="ml-4 flex min-w-0 flex-1 flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center justify-start">
                    <a href={item.track_url ?? "#"} target="_blank" rel="noopener noreferrer">
                      <p className="break-words text-sm font-medium sm:text-base">
                        {item.name}
                      </p>
                    </a>
                    {tutorial ? (
                      <img
                        src="https://placehold.co/20x20"
                        alt={item.name}
                        className="mx-2 size-5 rounded-full"
                      />
                    ) : (
                      <a href={item.track_url ?? "#"} target="_blank" rel="noopener noreferrer">
                        <img
                          src={spotifyLogo as string}
                          alt="Spotify"
                          className="mx-2 size-5"
                        />
                      </a>
                    )}
                  </div>
                  <p className="break-words text-xs text-muted-foreground sm:text-sm">
                    <a href={item.artist_url ?? "#"} target="_blank" rel="noopener noreferrer">
                      {item.artist ?? "Unknown Artist"}
                    </a>
                  </p>
                </div>

                <span className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
                  {item.played_at ? timeAgo(item.played_at) : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {items.length > 10 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show Less" : "Show More"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionList
