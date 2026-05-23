import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">General Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here you can manage general application settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Theme preferences are available via the toggle in the navigation bar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneralSettings
