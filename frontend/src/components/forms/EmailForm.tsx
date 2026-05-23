import { useState } from "react"
import { Check, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { updateEmail } from "@/lib/api/auth"
import { validateEmail } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

function CriteriaItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2",
        met ? "text-primary" : "text-muted-foreground",
      )}
    >
      {met ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {label}
    </li>
  )
}

export function EmailForm() {
  const { user } = useAuth()
  const original = user?.email ?? ""

  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const criteria = validateEmail(value)
  const allMet = Object.values(criteria).every(Boolean)
  const isEnabled = allMet && value !== original && value !== ""

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnabled) return
    setSubmitting(true)
    setMessage("")
    try {
      const data = await updateEmail(value)
      setIsSuccess(true)
      setMessage(data?.message ?? "Email updated successfully!")
    } catch (err) {
      setIsSuccess(false)
      setMessage(err instanceof Error ? err.message : "Failed to update email.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setValue("")
    setMessage("")
    setFocused(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1">
            <Label className="text-muted-foreground text-xs">Current Email</Label>
            <p className="bg-muted truncate rounded-md px-3 py-2 text-sm">
              {original || "Email not available"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="you@example.com"
              value={value}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={45}
            />
            {focused && (
              <ul className="bg-muted/40 mt-1 space-y-1 rounded-md border p-3 text-sm">
                <CriteriaItem met={criteria.length} label="Between 5 and 45 characters" />
                <CriteriaItem met={criteria.hasAtSymbol} label="Contains @ symbol" />
                <CriteriaItem met={criteria.hasDomain} label="Has a valid domain (e.g. example.com)" />
                <CriteriaItem met={criteria.hasValidTLD} label="Ends with valid TLD (e.g. .com)" />
                <CriteriaItem met={criteria.noSpaces} label="No spaces allowed" />
                <CriteriaItem met={criteria.validCharacters} label="Valid characters in the local part" />
              </ul>
            )}
          </div>

          {message && (
            <Alert variant={isSuccess ? "default" : "destructive"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={!isEnabled || submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default EmailForm
