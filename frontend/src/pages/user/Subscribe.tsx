import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/layout/PageContainer"
import { Spinner } from "@/components/Spinner"
import { startCheckout } from "@/lib/api/stripe"
import { toast } from "sonner"

export function Subscribe() {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const url = await startCheckout()
      window.location.href = url
    } catch {
      toast.error("Failed to initiate payment. Please try again.")
      setLoading(false)
    }
  }

  return (
    <PageContainer title="Subscribe" center>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Statvio subscription</CardTitle>
          <CardDescription>Statvio description</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4">
              <Spinner />
              <p className="text-muted-foreground mt-4 text-center text-sm">Processing...</p>
            </div>
          ) : (
            <Button onClick={handlePayment} disabled={loading} className="w-full">
              Subscribe
            </Button>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default Subscribe
