"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { LoadingSpinner } from "./loading-spinner"
import { MobileInput } from "./mobile-input"
import { generateMindmapMarkdown } from "../lib/generate-mindmap"
import { defaultMarkdown } from "../lib/default-markdown"
import { useToast } from "../hooks/use-toast"
import { useMobile } from "../hooks/use-mobile"
import { renderMindmap } from "../lib/mindmap-renderer"
import { parseMarkdown } from "../lib/markdown-parser"
import { useTheme } from "next-themes"
import * as d3 from "d3"

export const MindmapApp = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown) // Initialize with default markdown
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const isMobileCheck = useMobile()
  const [layout, setLayout] = useState<"right" | "bi">(isMobileCheck ? "right" : "bi") // Default to right on mobile
  const [colorScheme, setColorScheme] = useState<"default" | "vibrant" | "summer" | "monochrome">("default")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDefaultMindmap, setIsDefaultMindmap] = useState(true) // Track if we're showing the default mindmap
  const mindmapRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const currentTransformRef = useRef<any>(null)
  const zoomRef = useRef<any>(null)

  // Handle mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update the renderMindmapWithTransform function to be more stable:
  const renderMindmapWithTransform = useCallback(() => {
    if (!mindmapRef.current || !mounted) return

    try {
      // Parse markdown to hierarchical data
      const data = parseMarkdown(markdown)

      // Get the current theme
      const currentTheme = (resolvedTheme as "dark" | "light") || "dark"

      // Store the current transform before rendering
      const preserveTransform = currentTransformRef.current

      // Render mindmap with preserved transform and current theme
      const { zoom, svg } = renderMindmap(mindmapRef.current, data, {
        layout,
        colorScheme,
        preserveTransform,
        theme: currentTheme,
        isMobile, // Pass isMobile flag to renderer
      })

      // Store the zoom behavior for later use
      zoomRef.current = zoom

      // Only update the transform if we don't already have one
      if (!preserveTransform && svg.node()) {
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          const transform = d3.zoomTransform(svg.node() as any)
          currentTransformRef.current = transform
        })
      }
    } catch (error) {
      console.error("Error rendering mindmap:", error)
      toast({
        title: "Error rendering mindmap",
        description: "There was an error rendering your mindmap. Please try again.",
        variant: "destructive",
      })
    }
  }, [markdown, layout, colorScheme, resolvedTheme, mounted, toast, isMobile])

  // Update the setLayoutWithTransform function to be more stable:
  const setLayoutWithTransform = useCallback(
    (newLayout: "right" | "bi") => {
      // Only update if the layout actually changed
      if (layout === newLayout) return

      // Capture current transform before changing layout
      const currentTransform = currentTransformRef.current

      // Update the layout
      setLayout(newLayout)

      // Ensure we preserve the transform
      currentTransformRef.current = currentTransform
    },
    [layout],
  )

  // Update the setColorSchemeWithTransform function to be more stable:
  const setColorSchemeWithTransform = useCallback(
    (newScheme: "default" | "vibrant" | "summer" | "monochrome") => {
      // Only update if the scheme actually changed
      if (colorScheme === newScheme) return

      // Capture current transform before changing color scheme
      const currentTransform = currentTransformRef.current

      // Update the color scheme
      setColorScheme(newScheme)

      // Ensure we preserve the transform
      currentTransformRef.current = currentTransform
    },
    [colorScheme],
  )

  // Initialize mindmap
  useEffect(() => {
    if (!mindmapRef.current || !mounted) return

    renderMindmapWithTransform()

    return () => {
      // Clean up
      if (mindmapRef.current) {
        mindmapRef.current.innerHTML = ""
      }
    }
  }, [markdown, layout, colorScheme, resolvedTheme, mounted, renderMindmapWithTransform])

  // Handle mobile view
  useEffect(() => {
    if (isMobile) {
      // On mobile, start with sidebar closed
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  // Update layout when switching between mobile and desktop for default mindmap
  useEffect(() => {
    if (isDefaultMindmap) {
      setLayout(isMobile ? "right" : "bi")
    }
  }, [isMobile, isDefaultMindmap])

  // Handle window resize
  useEffect(() => {
    if (!mounted) return

    const handleResize = () => {
      // Use a debounce to avoid too many re-renders
      if (mindmapRef.current) {
        renderMindmapWithTransform()
      }
    }

    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 250)
    }

    window.addEventListener("resize", debouncedResize)
    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(resizeTimer)
    }
  }, [markdown, layout, colorScheme, resolvedTheme, mounted, renderMindmapWithTransform])

  // Handle theme change
  useEffect(() => {
    if (!mounted) return

    // Re-render when theme changes to apply correct styles
    renderMindmapWithTransform()
  }, [theme, resolvedTheme, mounted, renderMindmapWithTransform])

  // Handle click outside sidebar to close it on mobile
  useEffect(() => {
    if (!mounted || !isMobile) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-sidebar-trigger="true"]')
      ) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isSidebarOpen, isMobile, mounted])

  // Update the handleGenerateMindmap function to better preserve transform:
  const handleGenerateMindmap = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic is required",
        description: "Please enter a topic to generate a mindmap",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Close sidebar on mobile after generating
    if (isMobile) {
      setIsSidebarOpen(false)
    }

    // Clear the current mindmap to show the loading spinner
    if (mindmapRef.current) {
      mindmapRef.current.innerHTML = ""
    }

    try {
      // Reset transform for new mindmaps
      currentTransformRef.current = null

      const generatedMarkdown = await generateMindmapMarkdown(topic)

      // Update the markdown
      setMarkdown(generatedMarkdown)
      setIsDefaultMindmap(false) // Mark that we're no longer showing the default mindmap

      toast({
        title: "Mindmap generated",
        description: `Mindmap for "${topic}" has been created`,
      })
    } catch (error) {
      console.error("Error generating mindmap:", error)
      toast({
        title: "Error generating mindmap",
        description:
          error instanceof Error ? error.message : "There was an error generating your mindmap. Please try again.",
        variant: "destructive",
      })

      // If there was an error, re-render the previous mindmap
      renderMindmapWithTransform()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: "png" | "interactive") => {
    if (!mindmapRef.current) return

    try {
      // Parse the markdown to get the complete mindmap data
      const data = parseMarkdown(markdown)
      const currentTheme = (resolvedTheme as "dark" | "light") || "dark"

      // Create a temporary container for the export
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "-9999px"
      tempContainer.style.width = "5000px" // Large enough to fit the entire mindmap
      tempContainer.style.height = "3000px"
      document.body.appendChild(tempContainer)

      // Render the complete mindmap in the temporary container
      // Use null for preserveTransform to ensure we get the default view
      renderMindmap(tempContainer, data, {
        layout,
        colorScheme,
        preserveTransform: null, // No transform to get the full view
        theme: currentTheme,
        forExport: true, // Special flag for export mode
      })

      // Get the SVG element from the temporary container
      const svgElement = tempContainer.querySelector("svg")
      if (!svgElement) {
        document.body.removeChild(tempContainer)
        throw new Error("Failed to generate SVG for export")
      }

      // Get the bounding box of all content
      const gElement = svgElement.querySelector("g")
      if (!gElement) {
        document.body.removeChild(tempContainer)
        throw new Error("Failed to find content for export")
      }

      const bbox = gElement.getBBox()
      const width = bbox.width
      const height = bbox.height
      const x = bbox.x
      const y = bbox.y

      // Add padding
      const padding = 100
      const viewBox = `${x - padding} ${y - padding} ${width + padding * 2} ${height + padding * 2}`

      // Set the viewBox to include all content with padding
      svgElement.setAttribute("viewBox", viewBox)
      svgElement.setAttribute("width", `${width + padding * 2}`)
      svgElement.setAttribute("height", `${height + padding * 2}`)

      // Add font styles directly to the SVG to ensure they're preserved
      const style = document.createElement("style")
      style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
      .mindmap-node-text {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-weight: 500;
      }
      .mindmap-node-text.depth-0 {
        font-size: 18px;
        font-weight: 700;
      }
      .mindmap-node-text.depth-1 {
        font-size: 16px;
        font-weight: 700;
      }
      .mindmap-node-text.depth-2 {
        font-size: 14px;
        font-weight: 500;
      }
    `
      svgElement.prepend(style)

      if (format === "interactive") {
        // Create an interactive HTML file with the SVG embedded
        const svgData = new XMLSerializer().serializeToString(svgElement)

        // Create HTML content with improved zoom/pan functionality
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mindmap: ${topic || "Mindmap"} | Mind-Map-Maker.com</title>
        <meta name="description" content="Interactive mindmap created with Mind-Map-Maker.com">
        <meta name="generator" content="Mind-Map-Maker.com">
        <script defer data-domain="mind-map-maker.com" src="https://plausible.io/js/script.js"></script>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: ${currentTheme === "dark" ? "#1a1a1a" : "#ffffff"};
            color: ${currentTheme === "dark" ? "#ffffff" : "#000000"};
          }
          
          #svg-container {
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
          }
          
          svg {
            width: 100%;
            height: 100%;
            cursor: grab;
          }
          
          svg:active {
            cursor: grabbing;
          }
          
          .controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
          }
          
          .control-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: ${currentTheme === "dark" ? "#333" : "#f0f0f0"};
            color: ${currentTheme === "dark" ? "#fff" : "#333"};
            border: none;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background-color 0.2s;
          }
          
          .control-button:hover {
            background-color: ${currentTheme === "dark" ? "#444" : "#e0e0e0"};
          }
          
          .info-panel {
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: ${currentTheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"};
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            backdrop-filter: blur(5px);
            z-index: 1000;
            transition: opacity 0.3s;
          }
          
          .info-panel.hidden {
            opacity: 0;
          }
          
          .zoom-level {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: ${currentTheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"};
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            backdrop-filter: blur(5px);
          }
          
          .footer {
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
            opacity: 0.7;
            z-index: 1000;
          }
          
          .footer a {
            color: ${currentTheme === "dark" ? "#fff" : "#333"};
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div id="svg-container">
          ${svgData}
        </div>
        
        <div class="controls">
          <button class="control-button" id="zoom-in" title="Zoom In">+</button>
          <button class="control-button" id="zoom-out" title="Zoom Out">-</button>
          <button class="control-button" id="reset" title="Reset View">⟲</button>
          <button class="control-button" id="fit" title="Fit to Screen">⤢</button>
        </div>
        
        <div class="info-panel" id="info-panel">
          <p>Click and drag to pan. Use buttons or mouse wheel to zoom.</p>
        </div>
        
        <div class="zoom-level" id="zoom-level">100%</div>
        
        <div class="footer">
          <a href="https://mind-map-maker.com" target="_blank">Created with Mind-Map-Maker.com</a>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const svgContainer = document.getElementById('svg-container');
            const svg = svgContainer.querySelector('svg');
            const mainGroup = svg.querySelector('g');
            const infoPanel = document.getElementById('info-panel');
            const zoomLevelDisplay = document.getElementById('zoom-level');
            
            // Hide info panel after 5 seconds
            setTimeout(() => {
              infoPanel.classList.add('hidden');
            }, 5000);
            
            // Get the original viewBox
            const originalViewBox = svg.getAttribute('viewBox').split(' ').map(Number);
            
            // Calculate a better initial viewBox to fit the screen
            function calculateInitialViewBox() {
              const bbox = mainGroup.getBBox();
              const containerWidth = svgContainer.clientWidth;
              const containerHeight = svgContainer.clientHeight;
              
              // Calculate the aspect ratios
              const bboxRatio = bbox.width / bbox.height;
              const containerRatio = containerWidth / containerHeight;
              
              let viewBoxWidth, viewBoxHeight;
              
              if (bboxRatio > containerRatio) {
                // If the mindmap is wider than the container
                viewBoxWidth = bbox.width * 1.1; // Add 10% padding
                viewBoxHeight = viewBoxWidth / containerRatio;
              } else {
                // If the mindmap is taller than the container
                viewBoxHeight = bbox.height * 1.1; // Add 10% padding
                viewBoxWidth = viewBoxHeight * containerRatio;
              }
              
              const viewBoxX = bbox.x - (viewBoxWidth - bbox.width) / 2;
              const viewBoxY = bbox.y - (viewBoxHeight - bbox.height) / 2;
              
              return [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight];
            }
            
            // Set initial viewBox to fit the screen
            const initialViewBox = calculateInitialViewBox();
            svg.setAttribute('viewBox', initialViewBox.join(' '));
            
            // Variables for pan/zoom
            let isPanning = false;
            let startPoint = { x: 0, y: 0 };
            let currentViewBox = [...initialViewBox];
            let zoomLevel = 1;
            
            // Update zoom level display
            function updateZoomLevelDisplay() {
              zoomLevelDisplay.textContent = \`\${Math.round(zoomLevel * 100)}%\`;
            }
            
            // Pan functionality
            svg.addEventListener('mousedown', startPan);
            window.addEventListener('mousemove', pan);
            window.addEventListener('mouseup', endPan);
            
            // Touch support
            svg.addEventListener('touchstart', startPanTouch, { passive: false });
            window.addEventListener('touchmove', panTouch, { passive: false });
            window.addEventListener('touchend', endPan);
            
            // Zoom with mouse wheel - with moderate sensitivity
            svg.addEventListener('wheel', wheelZoom, { passive: false });
            
            // Control buttons
            document.getElementById('zoom-in').addEventListener('click', () => zoomByFactor(0.9));
            document.getElementById('zoom-out').addEventListener('click', () => zoomByFactor(1.1));
            document.getElementById('reset').addEventListener('click', resetView);
            document.getElementById('fit').addEventListener('click', fitToScreen);
            
            function startPan(evt) {
              isPanning = true;
              startPoint = { x: evt.clientX, y: evt.clientY };
              svg.style.cursor = 'grabbing';
            }
            
            function startPanTouch(evt) {
              if (evt.touches.length === 1) {
                evt.preventDefault();
                isPanning = true;
                startPoint = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
              }
            }
            
            function pan(evt) {
              if (!isPanning) return;
              
              const endPoint = { x: evt.clientX, y: evt.clientY };
              const dx = (startPoint.x - endPoint.x) * (currentViewBox[2] / svgContainer.clientWidth);
              const dy = (startPoint.y - endPoint.y) * (currentViewBox[3] / svgContainer.clientHeight);
              
              currentViewBox[0] += dx;
              currentViewBox[1] += dy;
              
              svg.setAttribute('viewBox', currentViewBox.join(' '));
              
              startPoint = endPoint;
            }
            
            function panTouch(evt) {
              if (!isPanning || evt.touches.length !== 1) return;
              
              evt.preventDefault();
              const endPoint = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
              const dx = (startPoint.x - endPoint.x) * (currentViewBox[2] / svgContainer.clientWidth);
              const dy = (startPoint.y - endPoint.y) * (currentViewBox[3] / svgContainer.clientHeight);
              
              currentViewBox[0] += dx;
              currentViewBox[1] += dy;
              
              svg.setAttribute('viewBox', currentViewBox.join(' '));
              
              startPoint = endPoint;
            }
            
            function endPan() {
              isPanning = false;
              svg.style.cursor = 'grab';
            }
            
            function wheelZoom(evt) {
              evt.preventDefault();
              
              const mouseX = evt.clientX;
              const mouseY = evt.clientY;
              
              // Calculate mouse position relative to SVG viewBox
              const pointX = currentViewBox[0] + (mouseX / svgContainer.clientWidth) * currentViewBox[2];
              const pointY = currentViewBox[1] + (mouseY / svgContainer.clientHeight) * currentViewBox[3];
              
              // Normalize wheel delta for better cross-browser support
              // Use a moderate factor for zooming - faster than before but not too fast
              const wheelDelta = evt.deltaY;
              const normalizedDelta = Math.sign(wheelDelta) * Math.min(Math.abs(wheelDelta * 0.05), 10);
              
              // Calculate zoom factor - moderate speed
              const zoomFactor = 1 + normalizedDelta * 0.09;
              
              // Apply zoom
              zoomAtPoint(pointX, pointY, zoomFactor);
            }
            
            function zoomByFactor(factor) {
              // Zoom centered on the middle of the viewBox
              const centerX = currentViewBox[0] + currentViewBox[2] / 2;
              const centerY = currentViewBox[1] + currentViewBox[3] / 2;
              
              zoomAtPoint(centerX, centerY, factor);
            }
            
            function zoomAtPoint(pointX, pointY, factor) {
              // Update zoom level
              zoomLevel = zoomLevel / factor;
              updateZoomLevelDisplay();
              
              // Calculate new dimensions
              const newWidth = currentViewBox[2] * factor;
              const newHeight = currentViewBox[3] * factor;
              
              // Calculate new top-left corner to zoom at the mouse point
              const newX = pointX - (pointX - currentViewBox[0]) * factor;
              const newY = pointY - (pointY - currentViewBox[1]) * factor;
              
              // Update viewBox
              currentViewBox = [newX, newY, newWidth, newHeight];
              svg.setAttribute('viewBox', currentViewBox.join(' '));
            }
            
            function resetView() {
              currentViewBox = [...originalViewBox];
              svg.setAttribute('viewBox', currentViewBox.join(' '));
              zoomLevel = 1;
              updateZoomLevelDisplay();
            }
            
            function fitToScreen() {
              currentViewBox = [...initialViewBox];
              svg.setAttribute('viewBox', currentViewBox.join(' '));
              zoomLevel = 1;
              updateZoomLevelDisplay();
            }
            
            // Initial zoom level display
            updateZoomLevelDisplay();
            
            // Handle window resize
            window.addEventListener('resize', () => {
              // Recalculate the initial viewBox when window is resized
              if (zoomLevel === 1) {
                const newInitialViewBox = calculateInitialViewBox();
                currentViewBox = [...newInitialViewBox];
                svg.setAttribute('viewBox', currentViewBox.join(' '));
              }
            });
          });
        </script>
      </body>
      </html>
      `

        // Create a blob with the HTML content
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)

        // Create a download link
        const a = document.createElement("a")
        a.href = url
        a.download = `mindmap-${topic || "export"}.html`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "png") {
        // Export as PNG with higher quality
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          document.body.removeChild(tempContainer)
          throw new Error("Failed to create canvas context")
        }

        // Set canvas size with higher resolution for better quality
        const scale = 2 // Higher resolution
        canvas.width = (width + padding * 2) * scale
        canvas.height = (height + padding * 2) * scale

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"

        img.onload = () => {
          // Fill background
          ctx.fillStyle = currentTheme === "dark" ? "#1a1a1a" : "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Scale the context for higher resolution
          ctx.scale(scale, scale)

          // Draw the image
          ctx.drawImage(img, 0, 0, width + padding * 2, height + padding * 2)

          // Reset scale
          ctx.scale(1 / scale, 1 / scale)

          // Add a small watermark
          ctx.font = `${10 * scale}px Arial`
          ctx.fillStyle = currentTheme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
          ctx.textAlign = "right"
          ctx.fillText("mind-map-maker.com", canvas.width - 10, canvas.height - 10)

          const pngUrl = canvas.toDataURL("image/png", 1.0) // Use maximum quality
          const a = document.createElement("a")
          a.href = pngUrl
          a.download = `mindmap-${topic || "export"}.png`
          a.click()
          URL.revokeObjectURL(url)
        }

        img.onerror = (err) => {
          console.error("Image loading error:", err)
          document.body.removeChild(tempContainer)
          toast({
            title: "Export failed",
            description: "Failed to generate PNG. Please try again.",
            variant: "destructive",
          })
        }

        img.src = url
      }

      // Clean up the temporary container after a delay to ensure the image has loaded
      setTimeout(() => {
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
      }, 2000)

      toast({
        title: format === "interactive" ? "Interactive HTML exported" : `Exported as ${format.toUpperCase()}`,
        description: "Your mindmap has been exported successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: `Failed to export as ${format === "interactive" ? "HTML" : format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleExampleTopic = (exampleTopic: string) => {
    setTopic(exampleTopic)
    // Reset transform when generating a new example
    currentTransformRef.current = null
    handleGenerateMindmap()
  }

  // Create a memoized topic setter that doesn't cause re-renders of the mindmap
  const handleTopicChange = useCallback((newTopic: string) => {
    setTopic(newTopic)
  }, [])

  // Don't render until client-side to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div ref={sidebarRef} className="z-30 md:z-auto">
            <Sidebar
              topic={topic}
              setTopic={handleTopicChange}
              onGenerate={handleGenerateMindmap}
              onExport={handleExport}
              isGenerating={isGenerating}
              onExampleTopic={handleExampleTopic}
              isSettingsOpen={isSettingsOpen}
              layout={layout}
              setLayout={setLayoutWithTransform}
              colorScheme={colorScheme}
              setColorScheme={setColorSchemeWithTransform}
            />
          </div>
        )}
        <div className="flex-1 relative overflow-hidden">
          {/* Add padding-bottom on mobile to make room for the fixed input */}
          <div ref={mindmapRef} className="w-full h-full overflow-hidden md:pb-0 pb-16" tabIndex={0} />

          {/* Loading spinner overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={60} />
                <p className="text-lg font-medium text-primary">Generating your mindmap...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only fixed input at bottom of screen */}
      {isMobile && (
        <MobileInput
          topic={topic}
          setTopic={handleTopicChange}
          onGenerate={handleGenerateMindmap}
          isGenerating={isGenerating}
        />
      )}
    </div>
  )
}
