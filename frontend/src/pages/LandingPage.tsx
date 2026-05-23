import { Link } from "react-router-dom"
import { Activity, Layers3, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/layout/Footer"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Personalised suggestions and analytics for your music & podcast habits.",
  },
  {
    icon: Layers3,
    title: "Multi-Platform Tracking",
    description:
      "Combine your Spotify, Apple Music, and more in a single dashboard.",
  },
  {
    icon: Activity,
    title: "Real-Time Stats",
    description:
      "View your most-played tracks, artists, and trends as they evolve daily.",
  },
]

const stats = [
  { value: "N/A", label: "Users Worldwide" },
  { value: "N/A", label: "Data Points Collected" },
  { value: "N/A", label: "Supported Platforms" },
  { value: "N/A", label: "Uptime Reliability" },
]

const steps = [
  {
    title: "Connect Your Accounts",
    description:
      "Link your Spotify, Apple Music, and other streaming services with Statvio in a few easy steps.",
  },
  {
    title: "Get Insights",
    description:
      "AI-powered dashboards show your top genres, artists, and more, plus personalised recommendations.",
  },
  {
    title: "Stay Tuned",
    description:
      "Explore real-time updates, track your daily, weekly or monthly stats, and watch how your favourites evolve.",
  },
]

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Hero */}
      <header className="relative flex h-svh flex-col items-center justify-center overflow-hidden px-8 text-center">
        <div
          aria-hidden
          className="bg-primary/20 absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full blur-3xl"
        />
        <h1 className="relative mb-4 text-5xl font-extrabold tracking-tight">
          Welcome to <span className="text-primary">Statvio</span>
        </h1>
        <p className="text-muted-foreground relative mb-8 max-w-2xl text-lg">
          The one-stop hub for tracking and understanding your streaming habits
          across all your favourite platforms.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </header>

      {/* Features */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="text-center">
              <CardHeader className="items-center">
                <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
                  <Icon className="size-6" />
                </div>
                <CardTitle className="mt-3">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">Our Impact</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-primary mb-2 text-4xl font-extrabold">
                  {value}
                </div>
                <p className="text-muted-foreground text-lg">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="mb-10 text-3xl font-bold tracking-tight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className="bg-primary text-primary-foreground mb-4 flex size-16 items-center justify-center rounded-full text-xl font-bold">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground max-w-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
