import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"

export function Soundcloud() {
  return (
    <PageContainer title="Your Soundcloud Stats">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Soundcloud integration is coming soon. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default Soundcloud
