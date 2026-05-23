import { useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadProfileImage } from "@/lib/api/aws"
import { Button } from "@/components/ui/button"

interface ProfileImageUploadProps {
  onUploadSuccess: (url: string) => void
}

export function ProfileImageUpload({ onUploadSuccess }: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      setValidationError("Only JPEG and PNG files are allowed.")
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setValidationError("File size exceeds 5 MB.")
      return
    }

    setValidationError("")
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setValidationError("No file selected.")
      return
    }

    try {
      setUploading(true)
      const url = await uploadProfileImage(selectedFile)
      onUploadSuccess(url)
      toast.success("Profile picture updated!")
    } catch {
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Trigger button */}
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        Choose Image
      </Button>

      {/* Preview */}
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="size-40 rounded-full object-cover border"
        />
      )}

      {/* Validation error */}
      {validationError && (
        <p className="text-destructive text-sm">{validationError}</p>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Uploading…
          </span>
        ) : (
          "Upload"
        )}
      </Button>
    </div>
  )
}

export default ProfileImageUpload
