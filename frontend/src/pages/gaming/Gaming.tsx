import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"

export function Gaming() {
  return (
    <PageContainer title="Gaming">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Gaming tracking is coming soon. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default Gaming
