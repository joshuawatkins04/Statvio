import axios from "axios"
import { toApiError } from "./client"

// uploadProfileImage posts a cropped image blob to the AWS upload endpoint and
// returns the resulting public image URL. Uses multipart/form-data, so it does
// not go through the JSON client factory.
export async function uploadProfileImage(file: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("image", file)

    const token = localStorage.getItem("access_token")
    const { data } = await axios.post(
      import.meta.env.VITE_AWS_UPLOAD_URL,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    )
    return data.imageUrl ?? data.url
  } catch (error) {
    throw toApiError(error, "Failed to upload image.")
  }
}
