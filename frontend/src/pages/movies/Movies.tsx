import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"

export function Movies() {
  return (
    <PageContainer title="Movies">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Movies tracking is coming soon. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default Movies
