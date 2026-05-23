import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageContainer } from "@/components/layout/PageContainer"
import { Spinner } from "@/components/Spinner"
import { verifyCheckoutSession } from "@/lib/api/stripe"

// Stripe redirects here with ?session_id=... after checkout. Fulfilment is done
// by the backend webhook; this page only confirms the session and redirects.
export function SuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("Confirming your subscription...")
  const [verifying, setVerifying] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      setMessage("Missing session reference.")
      setVerifying(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const data = await verifyCheckoutSession(sessionId)
        if (cancelled) return
        if (data.status === "complete" || data.paymentStatus === "paid") {
          setMessage("Subscription active! Redirecting to your dashboard...")
        } else {
          setMessage("Payment received. Your subscription is being finalized...")
        }
        setDone(true)
      } catch {
        if (!cancelled) {
          setMessage(
            "We couldn't confirm your subscription yet. If you were charged, it will activate shortly.",
          )
        }
      } finally {
        if (!cancelled) setVerifying(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    if (!done) return undefined
    const timeout = setTimeout(() => navigate("/dashboard"), 2000)
    return () => clearTimeout(timeout)
  }, [done, navigate])

  return (
    <PageContainer title="Subscription Status" center>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {verifying ? (
            <Spinner />
          ) : (
            <>
              <p className="text-center text-muted-foreground">{message}</p>
              {done && (
                <p className="text-center text-sm text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              )}
              <Button asChild variant="outline" className="mt-2">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default SuccessPage
