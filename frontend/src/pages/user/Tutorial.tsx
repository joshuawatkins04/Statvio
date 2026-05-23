import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updateTutorialStatus } from "@/lib/api/auth"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// ─── Tutorial step data (ported from TutorialContent.js) ──────────────────────

interface TutorialStep {
  title: string
  body: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "1. Welcome to Statvio!",
    body: "Your one-stop hub for connecting and managing all your favourite streaming services and apps in one place.",
  },
  {
    title: "2. How to use",
    body: "Navigate to your dashboard, select the service you want, connect your account, and start exploring your stats!",
  },
  {
    title: "3. Try for yourself!",
    body: "Connect your accounts and see how Statvio works for you — explore your real listening history, top songs, and top artists.",
  },
]

const TOTAL_STEPS = TUTORIAL_STEPS.length

// ─── Example content data (ported from TutorialContent.js) ───────────────────

interface MediaItem {
  name: string
  image: string
  artist?: string
  timestamp?: string
}

const exampleTopSongs: MediaItem[] = [
  { name: "Method sometimes", image: "https://placehold.co/80x80" },
  { name: "Rate not someone", image: "https://placehold.co/80x80" },
  { name: "Fish military cost", image: "https://placehold.co/80x80" },
  { name: "After center page", image: "https://placehold.co/80x80" },
  { name: "Economy message yes", image: "https://placehold.co/80x80" },
]

const exampleTopArtists: MediaItem[] = [
  { name: "Maria Miller", image: "https://placehold.co/80x80" },
  { name: "Melissa Johnson", image: "https://placehold.co/80x80" },
  { name: "Joan Carr", image: "https://placehold.co/80x80" },
  { name: "Kaitlyn Richmond", image: "https://placehold.co/80x80" },
  { name: "Kayla Tyler", image: "https://placehold.co/80x80" },
]

const exampleListeningHistory: MediaItem[] = [
  {
    name: "Candidate cell sea",
    image: "https://placehold.co/48x48",
    artist: "Daniel Perez",
    timestamp: "2025-01-20T10:30:44.561452",
  },
  {
    name: "Another fine name",
    image: "https://placehold.co/48x48",
    artist: "Stephanie Tucker",
    timestamp: "2025-01-17T10:08:44.561825",
  },
  {
    name: "Government customer",
    image: "https://placehold.co/48x48",
    artist: "Daniel Baird",
    timestamp: "2025-01-17T06:16:44.562250",
  },
  {
    name: "About reach whole",
    image: "https://placehold.co/48x48",
    artist: "Elizabeth Cox",
    timestamp: "2025-01-21T04:54:44.563131",
  },
  {
    name: "Together seek order",
    image: "https://placehold.co/48x48",
    artist: "Justin Perez",
    timestamp: "2025-01-20T21:49:44.563434",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function MediaGrid({ title, items }: { title: string; items: MediaItem[] }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-muted flex flex-col items-center gap-2 rounded-lg p-3 text-center"
          >
            <img
              src={item.image}
              alt={item.name}
              className="size-16 rounded-md object-cover"
            />
            <p className="text-foreground text-xs font-medium leading-tight">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryList({ title, items }: { title: string; items: MediaItem[] }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.name + (item.timestamp ?? "")}
            className="bg-muted flex items-center gap-3 rounded-lg p-3"
          >
            <img
              src={item.image}
              alt={item.name}
              className="size-12 rounded-md object-cover"
            />
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-medium">
                {item.name}
              </p>
              {item.artist && (
                <p className="text-muted-foreground truncate text-xs">
                  {item.artist}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Tutorial component ──────────────────────────────────────────────────

export function Tutorial() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [showExample, setShowExample] = useState(false)
  const [finishing, setFinishing] = useState(false)

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100
  const isLastStep = step === TOTAL_STEPS - 1

  const handleNext = () => {
    if (isLastStep) {
      setShowExample(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleFinish = async () => {
    try {
      setFinishing(true)
      await updateTutorialStatus(true)
      navigate("/dashboard")
    } catch {
      // Silently degrade — navigate anyway so the user isn't stuck.
      navigate("/dashboard")
    } finally {
      setFinishing(false)
    }
  }

  const current = TUTORIAL_STEPS[step]

  return (
    <>
      {/* Step-by-step walkthrough */}
      <PageContainer title="How to use Statvio!">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Step {step + 1} of {TOTAL_STEPS}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <CardTitle className="mt-4 text-center text-xl">
              {current.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            <p className="text-muted-foreground text-center">{current.body}</p>

            <div className="flex w-full items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
                className="w-24"
              >
                Back
              </Button>

              {!showExample && (
                <Button onClick={handleNext} className="w-40">
                  {isLastStep ? "Connect to Statvio!" : "Next"}
                </Button>
              )}

              {showExample && (
                <Button
                  onClick={handleFinish}
                  disabled={finishing}
                  className="w-40"
                >
                  {finishing ? "Loading…" : "Get Started!"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainer>

      {/* Example content section — revealed after completing all steps */}
      {showExample && (
        <PageContainer title="Example Content">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex justify-center">
              <Button onClick={handleFinish} disabled={finishing} size="lg">
                {finishing ? "Loading…" : "Go to dashboard!"}
              </Button>
            </div>

            <MediaGrid title="Top Songs" items={exampleTopSongs} />
            <MediaGrid title="Top Artists" items={exampleTopArtists} />
            <HistoryList
              title="Listening History"
              items={exampleListeningHistory}
            />
          </div>
        </PageContainer>
      )}
    </>
  )
}

export default Tutorial
