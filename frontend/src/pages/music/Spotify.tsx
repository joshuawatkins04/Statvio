import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  getSpotifyStatus,
  getSpotifyOverview,
  getSpotifyTopSongs,
  getSpotifyTopArtists,
} from "@/lib/api/spotify"
import { PageContainer } from "@/components/layout/PageContainer"
import { SectionGrid, type SectionGridItem } from "@/layouts/SectionGrid"
import { SectionList, type SectionListItem } from "@/layouts/SectionList"
import { LoadingBar } from "@/components/LoadingBar"
import { AIPanel, type PlaylistItem } from "@/components/AIPanel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function Spotify() {
  const [loading, setLoading] = useState(true)
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [loadingArtists, setLoadingArtists] = useState(false)
  const [progress, setProgress] = useState(0)
  const [connected, setConnected] = useState(false)
  const [topSongs, setTopSongs] = useState<SectionGridItem[]>([])
  const [topArtists, setTopArtists] = useState<SectionGridItem[]>([])
  const [listeningHistory, setListeningHistory] = useState<SectionListItem[]>([])
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])

  const fetchSpotifyData = async () => {
    try {
      setLoading(true)
      setProgress(0)

      const status = await getSpotifyStatus()
      setProgress(25)

      if (!status.linked) {
        setConnected(false)
        return
      }

      setConnected(true)

      const overviewData = await getSpotifyOverview()
      setProgress(60)

      if (overviewData) {
        setTopSongs(overviewData.topSongs ?? [])
        setTopArtists(overviewData.topArtists ?? [])
        setListeningHistory(overviewData.listeningHistory ?? [])
        setPlaylists(overviewData.playlists ?? [])
      }

      setProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error fetching Spotify data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpotifyData()
  }, [])

  const fetchTopSongs = async (timeRange: string) => {
    try {
      setLoadingSongs(true)
      const response = await getSpotifyTopSongs(timeRange)
      if (response) {
        setTopSongs(response.topSongs ?? [])
      }
    } catch (error) {
      console.error("Error fetching top songs:", error)
    } finally {
      setLoadingSongs(false)
    }
  }

  const fetchTopArtists = async (timeRange: string) => {
    try {
      setLoadingArtists(true)
      const response = await getSpotifyTopArtists(timeRange)
      if (response) {
        setTopArtists(response.topArtists ?? [])
      }
    } catch (error) {
      console.error("Error fetching top artists:", error)
    } finally {
      setLoadingArtists(false)
    }
  }

  const handleTimeRangeChange = (timeRange: string) => {
    fetchTopSongs(timeRange)
    fetchTopArtists(timeRange)
  }

  const handleUpdateData = () => {
    fetchSpotifyData()
  }

  if (loading) {
    return <LoadingBar progress={progress} />
  }

  return (
    <PageContainer title="Your Spotify Stats">
      {connected && playlists.length > 0 ? (
        <>
          {/* Controls */}
          <Card className="mb-8">
            <CardContent className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row md:gap-6">
              <div className="flex flex-1 items-center justify-center gap-2 xs:gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleTimeRangeChange("short_term")}
                >
                  4 Weeks
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTimeRangeChange("medium_term")}
                >
                  6 Months
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTimeRangeChange("long_term")}
                >
                  Lifetime
                </Button>
              </div>

              <Separator
                orientation="vertical"
                className="hidden h-16 md:block"
              />
              <Separator className="w-full md:hidden" />

              <div className="flex flex-1 items-center justify-center gap-4 xs:gap-10">
                <Link
                  to="/settings?section=manage-api"
                  className="text-sm font-semibold underline"
                >
                  Unlink
                </Link>
                <button
                  onClick={handleUpdateData}
                  className="cursor-pointer text-sm font-semibold underline"
                >
                  Update Data
                </button>
              </div>
            </CardContent>
          </Card>

          <AIPanel items={playlists} />
          <SectionGrid title="Top Songs" items={topSongs} loading={loadingSongs} />
          <SectionGrid
            title="Top Artists"
            items={topArtists}
            loading={loadingArtists}
          />
          <SectionList title="Listening History" items={listeningHistory} />
        </>
      ) : (
        <div className="mt-8 text-center">
          {!connected ? (
            <p>
              <span className="font-bold">In development mode.</span>
              {" "}To be added to the list of users for testing, contact{" "}
              joshua@watkinsfamily.com.au with First and Last Name and Email of
              your Spotify account.
              <br />
              <span className="mt-2 block">
                Spotify not connected. Click{" "}
                <Link
                  to="/settings?section=manage-api"
                  className="font-semibold underline"
                >
                  Connect Spotify
                </Link>{" "}
                to connect.
              </span>
            </p>
          ) : (
            <p>
              No playlists found. Try &ldquo;Update Data&rdquo; or check your
              Spotify account.
            </p>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default Spotify
