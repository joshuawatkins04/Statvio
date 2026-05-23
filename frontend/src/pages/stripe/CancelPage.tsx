import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PageContainer } from "@/components/layout/PageContainer"

export function CancelPage() {
  return (
    <PageContainer center>
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Checkout Cancelled</CardTitle>
          <CardDescription>
            Your subscription checkout was cancelled. No charge was made.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Button asChild className="w-full">
            <Link to="/subscribe">Back to Subscribe</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default CancelPage
