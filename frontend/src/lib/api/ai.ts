import { createApiClient } from "./client"

// AI integration client. Backed by VITE_AI_BASE_URL.
const aiApi = createApiClient(import.meta.env.VITE_AI_BASE_URL, true)

export default aiApi
