import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/validation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// CriteriaItem renders a single pass/fail validation rule.
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

// CriteriaList is the bordered checklist shown while a field is focused.
function CriteriaList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="bg-muted/40 mt-2 space-y-1 rounded-md border p-3 text-sm">
      {children}
    </ul>
  )
}

export function Signup() {
  useAuthRedirect()

  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const [usernameFocused, setUsernameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const usernameCriteria = validateUsername(username)
  const emailCriteria = validateEmail(email)
  const passwordCriteria = validatePassword(password, confirmPassword)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSuccess(false)

    if (!Object.values(usernameCriteria).every(Boolean)) {
      setMessage("Username does not meet criteria.")
      return
    }
    if (!Object.values(emailCriteria).every(Boolean)) {
      setMessage("Email does not meet criteria.")
      return
    }
    if (!Object.values(passwordCriteria).every(Boolean)) {
      setMessage("Password does not meet the criteria.")
      return
    }

    try {
      await register(username, email, password)
      setIsSuccess(true)
      setMessage("Success! Redirecting…")
      setTimeout(() => navigate("/login"), 1000)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed.")
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 pt-24 pb-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Statvio Account</CardTitle>
          <CardDescription>
            Track your streaming stats across every platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert
              variant={isSuccess ? "default" : "destructive"}
              className="mb-4"
            >
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                placeholder="Enter your username"
                maxLength={20}
                required
              />
              {usernameFocused && (
                <CriteriaList>
                  <CriteriaItem
                    met={usernameCriteria.length}
                    label="Between 4 and 20 characters"
                  />
                  <CriteriaItem
                    met={usernameCriteria.validCharacters}
                    label="Only letters, numbers, and underscores"
                  />
                  <CriteriaItem
                    met={usernameCriteria.noSpaces}
                    label="No spaces allowed"
                  />
                </CriteriaList>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="you@example.com"
                maxLength={45}
                required
              />
              {emailFocused && (
                <CriteriaList>
                  <CriteriaItem
                    met={emailCriteria.length}
                    label="Between 5 and 45 characters"
                  />
                  <CriteriaItem
                    met={emailCriteria.hasAtSymbol}
                    label="Contains @ symbol"
                  />
                  <CriteriaItem
                    met={emailCriteria.hasDomain}
                    label="Has a valid domain (e.g. example.com)"
                  />
                  <CriteriaItem
                    met={emailCriteria.hasValidTLD}
                    label="Ends with valid TLD (e.g. .com)"
                  />
                  <CriteriaItem
                    met={emailCriteria.noSpaces}
                    label="No spaces allowed"
                  />
                  <CriteriaItem
                    met={emailCriteria.validCharacters}
                    label="Valid characters in the local part"
                  />
                </CriteriaList>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                maxLength={40}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••"
                maxLength={40}
                required
              />
              {passwordFocused && (
                <CriteriaList>
                  <CriteriaItem
                    met={passwordCriteria.length}
                    label="Between 8 and 40 characters"
                  />
                  <CriteriaItem
                    met={passwordCriteria.uppercase}
                    label="At least one uppercase letter"
                  />
                  <CriteriaItem
                    met={passwordCriteria.lowercase}
                    label="At least one lowercase letter"
                  />
                  <CriteriaItem
                    met={passwordCriteria.number}
                    label="At least one number"
                  />
                  <CriteriaItem
                    met={passwordCriteria.specialCharacters}
                    label="At least one special character (@$!%*?&)"
                  />
                  <CriteriaItem
                    met={passwordCriteria.matchesConfirm}
                    label="Passwords match"
                  />
                </CriteriaList>
              )}
            </div>

            <Button type="submit" className="mt-2">
              Sign Up
            </Button>
          </form>

          <div className="text-muted-foreground mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default Signup
