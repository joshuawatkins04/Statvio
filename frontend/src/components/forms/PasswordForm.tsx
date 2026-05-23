import { useState } from "react"
import { Check, X } from "lucide-react"
import { updatePassword } from "@/lib/api/auth"
import { validatePassword } from "@/lib/validation"
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

export function PasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [focused, setFocused] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const criteria = validatePassword(newPassword, confirmPassword)
  const allMet =
    criteria.length &&
    criteria.uppercase &&
    criteria.lowercase &&
    criteria.number &&
    criteria.specialCharacters &&
    criteria.matchesConfirm
  const isEnabled = allMet && newPassword !== "" && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnabled) return
    setSubmitting(true)
    setMessage("")
    try {
      const data = await updatePassword(newPassword, confirmPassword)
      setIsSuccess(true)
      setMessage(data?.message ?? "Password updated successfully!")
      handleCancel()
    } catch (err) {
      setIsSuccess(false)
      setMessage(err instanceof Error ? err.message : "Failed to update password.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNewPassword("")
    setConfirmPassword("")
    setMessage("")
    setFocused(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-1">
            <Label className="text-muted-foreground text-xs">Current Password</Label>
            <p className="bg-muted rounded-md px-3 py-2 text-sm tracking-widest">
              ••••••••
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setMessage("")
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={40}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setMessage("")
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={40}
            />
            {focused && (
              <ul className="bg-muted/40 mt-1 space-y-1 rounded-md border p-3 text-sm">
                <CriteriaItem met={criteria.length} label="Between 8 and 40 characters" />
                <CriteriaItem met={criteria.uppercase} label="At least one uppercase letter" />
                <CriteriaItem met={criteria.lowercase} label="At least one lowercase letter" />
                <CriteriaItem met={criteria.number} label="At least one number" />
                <CriteriaItem met={criteria.specialCharacters} label="At least one special character (@$!%*?&)" />
                <CriteriaItem met={criteria.matchesConfirm} label="Passwords match" />
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

export default PasswordForm
