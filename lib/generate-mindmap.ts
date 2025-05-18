// Updated to call the backend API instead of using placeholder data

export async function generateMindmapMarkdown(topic: string): Promise<string> {
  try {
    // Call the backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-mindmap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate mindmap")
    }

    const data = await response.json()
    return data.markdown
  } catch (error) {
    console.error("Error generating mindmap:", error)
    throw error
  }
}
