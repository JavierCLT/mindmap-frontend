// Updated to call the backend API with proper error handling and URL validation

export async function generateMindmapMarkdown(topic: string): Promise<string> {
  try {
    // Get the backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

    // Check if backendUrl is defined
    if (!backendUrl) {
      console.error("Backend URL is not defined. Please check your environment variables.")
      throw new Error("Backend URL is not configured. Please contact the administrator.")
    }

    // Ensure the URL doesn't end with a slash before adding the endpoint
    const apiUrl = backendUrl.endsWith("/") ? `${backendUrl}generate-mindmap` : `${backendUrl}/generate-mindmap`

    console.log(`Calling API at: ${apiUrl}`)

    // Call the backend API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
      // Try to get error details if available
      let errorMessage = `Failed to generate mindmap (Status: ${response.status})`
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        // If we can't parse the error response, just use the status text
        errorMessage = `Failed to generate mindmap: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data.markdown
  } catch (error) {
    console.error("Error generating mindmap:", error)
    throw error
  }
}
