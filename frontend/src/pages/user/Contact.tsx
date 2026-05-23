import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageContainer } from "@/components/layout/PageContainer"
import { Footer } from "@/components/layout/Footer"

const MAX_MESSAGE_LENGTH = 500

export function Contact() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage("")
    setStatusType(null)

    try {
      // ADD SEND LOGIC
      setStatusMessage("Your message has been sent successfully!")
      setStatusType("success")
      setName("")
      setUsername("")
      setEmail("")
      setPhone("")
      setMessage("")
    } catch {
      setStatusMessage("There was an error sending your message. Please try again.")
      setStatusType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <PageContainer title="Contact Us">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            {statusMessage && (
              <Alert
                variant={statusType === "error" ? "destructive" : "default"}
                className="mb-4"
              >
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  maxLength={60}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Username"
                  maxLength={20}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={45}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="123-456-7890"
                  maxLength={14}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                        setMessage(e.target.value)
                      }
                    }}
                    placeholder="Your message here..."
                    rows={5}
                    required
                    maxLength={MAX_MESSAGE_LENGTH}
                    className="resize-y"
                    style={{ maxHeight: "300px", minHeight: "100px" }}
                  />
                  <div className="text-muted-foreground absolute bottom-2 right-4 text-sm">
                    {MAX_MESSAGE_LENGTH - message.length} characters remaining
                  </div>
                </div>
              </div>

              <Button type="submit" className="mt-2" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageContainer>
      <Footer />
    </div>
  )
}

export default Contact
