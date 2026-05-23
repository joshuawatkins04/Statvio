import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SelectionLayoutProps {
  title: string
  bodyText: string
  connectToService: () => void | Promise<void>
  buttonText: string
}

export function SelectionLayout({
  title,
  bodyText,
  connectToService,
  buttonText,
}: SelectionLayoutProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await connectToService()
    } catch (error) {
      console.error("Error in button action:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="transition hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{bodyText}</p>
        <Button
          onClick={handleClick}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {loading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}

export default SelectionLayout
