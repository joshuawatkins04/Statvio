import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/Spinner"
import spotifyLogo from "@/assets/Primary_Logo_Black_CMYK.svg"

export interface SectionGridItem {
  id?: string | number
  name: string
  image_url?: string
  track_url?: string
  artist_url?: string
}

interface SectionGridProps {
  title: string
  items: SectionGridItem[]
  loading?: boolean
  tutorial?: boolean
}

export function SectionGrid({ title, items, loading, tutorial }: SectionGridProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const visibleItems = isExpanded ? items : items.slice(0, 5)

  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
          <ChevronDown
            className={`size-5 text-muted-foreground transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
        <div className="mt-4 border-t" />
      </CardHeader>

      <CardContent className="pt-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            {visibleItems.map((item, index) => (
              <li
                key={item.id ?? `section-grid-${index}`}
                className="flex flex-col items-center"
              >
                <a
                  href={item.track_url ?? item.artist_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="max-w-44">
                    <div className="flex aspect-square w-full max-h-44 items-center justify-center overflow-hidden rounded-md">
                      <img
                        src={item.image_url ?? "https://placehold.co/1000x1000"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="line-clamp-2 text-sm font-medium sm:text-base">
                        <span className="font-bold">{index + 1}. </span>
                        {item.name}
                      </span>
                      {tutorial ? (
                        <img
                          src="https://placehold.co/20x20"
                          alt={item.name}
                          className="size-5 rounded-full"
                        />
                      ) : (
                        <img
                          src={spotifyLogo as string}
                          alt="Spotify"
                          className="size-5"
                        />
                      )}
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default SectionGrid
