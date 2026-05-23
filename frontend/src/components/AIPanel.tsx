import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/Spinner"
import { getRecommendedSongs, getPlaylistStats } from "@/lib/api/spotify"
import spotifyLogo from "@/assets/Primary_Logo_Black_CMYK.svg"

type Mode = "Recommend Songs" | "Playlist Stats" | ""

export interface PlaylistItem {
  id?: string
  name: string
  image_url?: string
  [key: string]: unknown
}

interface AIPanelProps {
  items: PlaylistItem[]
}

export function AIPanel({ items }: AIPanelProps) {
  const [generatedResponse, setGeneratedResponse] = useState(
    "Waiting for mode and playlist to be selected..."
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("")
  const [selectedPlaylist, setSelectedPlaylist] = useState("")

  const totalItems = items.length

  useEffect(() => {
    const updateItemsPerPage = () => {
      setItemsPerPage(window.innerWidth < 480 ? 1 : 5)
    }
    updateItemsPerPage()
    window.addEventListener("resize", updateItemsPerPage)
    return () => window.removeEventListener("resize", updateItemsPerPage)
  }, [])

  useEffect(() => {
    if (mode) {
      setGeneratedResponse(
        `Mode selected: ${mode}. Select a playlist and then click generate...`
      )
    }
  }, [mode])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
  }

  const handlePlaylistSelection = async (playlistId: string) => {
    try {
      setLoading(true)
      let response: { data?: { response?: string } } | undefined

      if (mode === "Recommend Songs") {
        response = await getRecommendedSongs(playlistId)
      } else if (mode === "Playlist Stats") {
        response = await getPlaylistStats(playlistId)
      } else {
        return
      }

      const text = response?.data?.response ?? "No response received."
      setGeneratedResponse(text)
    } catch (error) {
      console.error("Error fetching AI response:", error)
      setGeneratedResponse("Failed to generate response.")
    } finally {
      setLoading(false)
      setMode("")
      setSelectedPlaylist("")
    }
  }

  const visibleItems = items
    .slice(currentIndex, currentIndex + itemsPerPage)
    .concat(
      items.slice(0, Math.max(0, currentIndex + itemsPerPage - totalItems))
    )

  const canGenerate = Boolean(selectedPlaylist && mode)

  return (
    <Card className="mb-8">
      <CardHeader className="pb-0">
        <div className="flex flex-col items-start justify-between gap-3 xs:flex-row xs:items-center">
          <h3 className="text-lg font-semibold sm:text-xl">AI Insights</h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-48 justify-between">
                {mode || "Select Mode"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onSelect={() => setMode("Recommend Songs")}>
                Recommend Songs
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setMode("Playlist Stats")}>
                Playlist Stats
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 border-t" />
      </CardHeader>

      <CardContent className="pt-4">
        {/* Playlist carousel */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="icon"
            className="flex-shrink-0 rounded-full"
            onClick={handlePrev}
            disabled={totalItems === 0}
          >
            &lt;
          </Button>

          <div className="relative w-full overflow-hidden">
            <ul className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-5">
              {visibleItems.map((item, index) => {
                const displayIndex =
                  currentIndex + index + 1 > totalItems
                    ? currentIndex + index + 1 - totalItems
                    : currentIndex + index + 1

                return (
                  <li
                    key={item.id ?? `ai-item-${index}`}
                    onClick={() =>
                      setSelectedPlaylist((prev) =>
                        prev === item.id ? "" : (item.id ?? "")
                      )
                    }
                    className={`flex cursor-pointer flex-col items-center rounded-lg transition-shadow ${
                      selectedPlaylist === item.id
                        ? "outline outline-2 outline-primary outline-offset-2 shadow-lg"
                        : "outline-none"
                    }`}
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
                          <span className="font-bold">{displayIndex}.</span>{" "}
                          <span
                            className={
                              item.name.trim() ? "" : "italic text-muted-foreground"
                            }
                          >
                            {item.name.trim() ? item.name : "No name"}
                          </span>
                        </span>
                        <img
                          src={spotifyLogo as string}
                          alt="Spotify"
                          className="size-5"
                        />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <Button
            variant="default"
            size="icon"
            className="flex-shrink-0 rounded-full"
            onClick={handleNext}
            disabled={totalItems === 0}
          >
            &gt;
          </Button>
        </div>

        <div className="mt-4 border-t" />

        {/* AI Response */}
        <div className="mt-4 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold sm:text-xl">AI Response</h3>
            <Button
              onClick={() => handlePlaylistSelection(selectedPlaylist)}
              disabled={!canGenerate || loading}
            >
              Generate
            </Button>
          </div>

          <div className="break-words">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <Spinner />
              </div>
            ) : (
              generatedResponse.split("\n").map((line, index) => {
                const formattedLine = line.replace(
                  /\*\*(.*?)\*\*/g,
                  "<strong>$1</strong>"
                )
                return (
                  <p
                    key={index}
                    dangerouslySetInnerHTML={{ __html: formattedLine }}
                    className="mb-2"
                  />
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIPanel
