import { UsernameForm } from "@/components/forms/UsernameForm"
import { EmailForm } from "@/components/forms/EmailForm"
import { PasswordForm } from "@/components/forms/PasswordForm"

export function ManageAccount() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Manage Account</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Here you can update your account information and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <UsernameForm />
        <EmailForm />
        <PasswordForm />
      </div>
    </div>
  )
}

export default ManageAccount
