// Updated with better debugging and error handling

export async function generateMindmapMarkdown(topic: string): Promise<string> {
  try {
    // Get the backend URL from environment variable
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

    // Check if backendUrl is defined
    if (!backendUrl) {
      console.error("Backend URL is not defined. Using fallback URL.")
      // Use a fallback URL
      backendUrl = "https://mindmap-backend-five.vercel.app"
    }

    // Ensure the URL is absolute by checking for http/https protocol
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `https://${backendUrl}`
    }

    // Remove trailing slash if present
    backendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl

    // Construct the full API URL
    const apiUrl = `${backendUrl}/generate-mindmap`

    console.log(`Calling API at: ${apiUrl} with topic: ${topic}`)

    // Create request body
    const requestBody = JSON.stringify({ topic })
    console.log(`Request body: ${requestBody}`)

    // Call the backend API with more detailed logging
    console.log("Sending request...")
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: window.location.origin,
      },
      body: requestBody,
      // Add credentials if your API requires cookies
      // credentials: 'include',
    })

    console.log(`Response status: ${response.status} ${response.statusText}`)
    console.log(`Response headers:`, Object.fromEntries([...response.headers.entries()]))

    if (!response.ok) {
      // Try to get error details if available
      let errorMessage = `Failed to generate mindmap (Status: ${response.status})`
      try {
        const errorText = await response.text()
        console.log(`Error response body: ${errorText}`)

        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError)
          errorMessage = `Failed to generate mindmap: ${errorText || response.statusText}`
        }
      } catch (e) {
        console.error("Error reading response body:", e)
        errorMessage = `Failed to generate mindmap: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    // Try to parse the response as text first to debug
    const responseText = await response.text()
    console.log(`Response body: ${responseText.substring(0, 200)}...`)

    // Then parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Error parsing JSON:", e)
      throw new Error("Invalid JSON response from server")
    }

    if (!data.markdown) {
      console.error("Response doesn't contain markdown:", data)
      throw new Error("Invalid response format: missing markdown field")
    }

    return data.markdown
  } catch (error) {
    console.error("Error generating mindmap:", error)
    throw error
  }
}
