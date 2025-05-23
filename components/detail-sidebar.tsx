"use client"

import { X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { LoadingSpinner } from "./loading-spinner"
import { useEffect, useState } from "react"

interface DetailSidebarProps {
  isOpen: boolean
  onClose: () => void
  nodeId: string | null
  nodeName: string | null
  topic: string
}

export function DetailSidebar({ isOpen, onClose, nodeId, nodeName, topic }: DetailSidebarProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)

  // Fetch detailed content when a node is selected
  useEffect(() => {
    if (!isOpen || !nodeId || !nodeName) {
      setContent(null)
      return
    }

    setLoading(true)
    setError(null)

    // Simulate a delay to show loading state
    setTimeout(() => {
      try {
        // Try to fetch from backend
        const fetchDetailedContent = async () => {
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
            const apiUrl = `${backendUrl}/node-details`

            console.log(`Calling API at: ${apiUrl} with node: ${nodeName}`)

            // Create request body
            const requestBody = JSON.stringify({
              topic,
              nodeId,
              nodeName,
            })

            // Call the backend API
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Origin: window.location.origin,
              },
              body: requestBody,
              // Add a short timeout to fail quickly if the backend is not available
              signal: AbortSignal.timeout(3000),
            })

            if (!response.ok) {
              throw new Error(`Failed to fetch details (Status: ${response.status})`)
            }

            const data = await response.json()

            if (!data.content) {
              throw new Error("Invalid response format: missing content field")
            }

            setContent(data.content)
          } catch (error) {
            console.error("Error fetching node details:", error)

            // Show a fallback content since the backend is not available
            setContent(`
              <h3>Details for "${nodeName}"</h3>
              <p>This is a placeholder for detailed information about this node.</p>
              <p>In a fully implemented version, this would show AI-generated content specific to "${nodeName}" in the context of "${topic}".</p>
              <hr />
              <p><em>Note: The backend API endpoint for node details is not currently available. This is a placeholder.</em></p>
            `)
          } finally {
            setLoading(false)
          }
        }

        fetchDetailedContent()
      } catch (error) {
        console.error("Error in detail sidebar:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch details")
        setLoading(false)
      }
    }, 500) // Short delay to show loading state
  }, [isOpen, nodeId, nodeName, topic])

  if (!isOpen) return null

  return (
    <div className="w-80 min-w-[20rem] border-l border-border bg-card overflow-y-auto h-full transition-all duration-300 animate-in slide-in-from-right">
      <Card className="border-0 rounded-none h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-card z-10 border-b">
          <CardTitle className="text-sm truncate pr-2">{nodeName || "Node Details"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoadingSpinner size={30} />
              <p className="text-sm text-muted-foreground mt-2">Loading details...</p>
            </div>
          ) : error ? (
            <div className="py-4 text-destructive">
              <p className="font-medium mb-1">Error loading details</p>
              <p className="text-sm">{error}</p>
              <div className="mt-4 p-4 bg-muted/30 rounded-md">
                <h3 className="text-sm font-medium mb-2">Details for "{nodeName}"</h3>
                <p className="text-sm">This would show detailed information about this node.</p>
                <p className="text-sm mt-2">
                  In a fully implemented version, this would show AI-generated content specific to this topic.
                </p>
              </div>
            </div>
          ) : content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
            <div className="py-4 text-muted-foreground">
              <p>Select a node to view detailed information.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
