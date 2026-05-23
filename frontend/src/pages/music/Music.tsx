import { connectToSpotify } from "@/lib/api/spotify"
import { connectToSoundcloud } from "@/lib/api/soundcloud"
import { PageContainer } from "@/components/layout/PageContainer"
import { SelectionLayout } from "@/layouts/SelectionLayout"

export function Music() {
  return (
    <PageContainer title="Music">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectionLayout
          title="Spotify"
          bodyText="Connect your Spotify account to view insights and more!"
          connectToService={connectToSpotify}
          buttonText="Connect to Spotify"
        />
        <SelectionLayout
          title="Soundcloud"
          bodyText="Connect your Soundcloud account to view insights and more!"
          connectToService={connectToSoundcloud}
          buttonText="Connect to Soundcloud"
        />
      </div>
    </PageContainer>
  )
}

export default Music
