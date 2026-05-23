import { Progress } from "@/components/ui/progress"

interface LoadingBarProps {
  progress: number
}

export function LoadingBar({ progress }: LoadingBarProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background">
      <p className="text-lg font-medium">Loading Spotify data...</p>
      <div className="w-64">
        <Progress value={progress} className="h-4" />
      </div>
      <p className="text-sm text-muted-foreground">{progress}%</p>
    </div>
  )
}

export default LoadingBar
