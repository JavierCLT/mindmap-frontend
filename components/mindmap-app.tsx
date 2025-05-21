"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import * as d3 from "d3"
import { useTheme } from "next-themes"
import sanitizeHtml from "sanitize-html"

// Mock default markdown
const defaultMarkdown = `
# Mind Map
## Branch 1
### Sub-branch 1.1
### Sub-branch 1.2
## Branch 2
### Sub-branch 2.1
### Sub-branch 2.2
`

// Mock parseMarkdown
interface MindmapNode {
  id: string
  label: string
  children: MindmapNode[]
  depth: number
}

const parseMarkdown = (markdown: string): MindmapNode => {
  const lines = markdown.split("\n").filter((line) => line.trim())
  const root: MindmapNode = { id: "root", label: "", children: [], depth: 0 }
  const stack: MindmapNode[] = [root]
  let lastDepth = 0

  for (const line of lines) {
    const depth = line.match(/^#+/)?.[0].length || 0
    const label = sanitizeHtml(line.replace(/^#+/, "").trim(), { allowedTags: [] })
    const node: MindmapNode = { id: `${label}-${depth}`, label, children: [], depth }

    if (depth > lastDepth) {
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    } else if (depth === lastDepth) {
      stack.pop()
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    } else {
      while (stack.length > depth) stack.pop()
      stack[stack.length - 1].children.push(node)
      stack.push(node)
    }
    lastDepth = depth
  }

  root.label = root.children[0]?.label || "Root"
  root.children = root.children[0]?.children || []
  return root
}

// Mock generateMindmapMarkdown
const generateMindmapMarkdown = async (topic: string): Promise<string> => {
  // Simulate async API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return `
# ${sanitizeHtml(topic)}
## ${sanitizeHtml(topic)} Concept 1
### Sub-concept 1.1
### Sub-concept 1.2
## ${sanitizeHtml(topic)} Concept 2
### Sub-concept 2.1
### Sub-concept 2.2
`
}

// Mock renderMindmap
const renderMindmap = (
  container: HTMLDivElement,
  data: MindmapNode,
  options: {
    layout: "right" | "bi"
    colorScheme: "default" | "vibrant" | "summer" | "monochrome"
    preserveTransform?: any
    theme: "dark" | "light"
    isMobile: boolean
    forExport?: boolean
  },
) => {
  const { layout, colorScheme, preserveTransform, theme, isMobile, forExport } = options
  const width = forExport ? 1000 : container.clientWidth
  const height = forExport ? 1000 : container.clientHeight
  container.innerHTML = ""

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("aria-label", "Mind map")

  const g = svg.append("g")
  const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
    g.attr("transform", event.transform)
  })

  svg.call(zoom)
  if (preserveTransform) svg.call(zoom.transform, preserveTransform)

  // Mock rendering nodes (simplified)
  const node = g
    .selectAll(".node")
    .data([data])
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", `translate(${width / 2},${height / 2})`)

  node
    .append("circle")
    .attr("r", 20)
    .attr("fill", colorScheme === "default" ? (theme === "dark" ? "#fff" : "#000") : "#f00")

  node
    .append("text")
    .attr("class", "mindmap-node-text")
    .attr("dy", ".35em")
    .text((d) => d.label)
    .attr("aria-label", (d) => `Node: ${d.label}`)

  return { zoom, svg }
}

// Mock useMobile hook
const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Mock useToast hook
const useToast = () => {
  const toast = ({
    title,
    description,
    variant,
    action,
  }: {
    title: string
    description: string
    variant?: "default" | "destructive"
    action?: React.ReactNode
  }) => {
    // Simulate toast (replace with actual toast library like react-hot-toast)
    console.log(`Toast: ${title} - ${description} (${variant})`, action)
    alert(`${title}\n${description}`)
  }
  return { toast }
}

// Mock Header component
const Header: React.FC<{ toggleSidebar: () => void; isSidebarOpen: boolean }> = ({
  toggleSidebar,
  isSidebarOpen,
}) => (
  <header className="bg-primary text-white p-4 flex justify-between items-center">
    <h1 className="text-lg font-bold">Mind Map Maker</h1>
    <button
      onClick={toggleSidebar}
      className="p-2 rounded bg-primary-foreground text-primary"
      aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      data-sidebar-trigger="true"
    >
      {isSidebarOpen ? "Close" : "Menu"}
    </button>
  </header>
)

// Mock Sidebar component
const Sidebar: React.FC<{
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  onExport: (format: "png" | "interactive") => void
  isGenerating: boolean
  onExampleTopic: (topic: string) => void
  isSettingsOpen: boolean
  layout: "right" | "bi"
  setLayout: (layout: "right" | "bi") => void
  colorScheme: "default" | "vibrant" | "summer" | "monochrome"
  setColorScheme: (scheme: "default" | "vibrant" | "summer" | "monochrome") => void
}> = ({
  topic,
  setTopic,
  onGenerate,
  onExport,
  isGenerating,
  onExampleTopic,
  isSettingsOpen,
  layout,
  setLayout,
  colorScheme,
  setColorScheme,
}) => (
  <aside className="bg-background p-4 h-full border-r border-primary/30">
    <input
      type="text"
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      placeholder="Enter topic"
      className="w-full p-2 mb-4 border rounded"
      aria-label="Mind map topic"
    />
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className="w-full p-2 mb-2 bg-primary text-white rounded disabled:opacity-50"
      aria-label="Generate mind map"
    >
      {isGenerating ? "Generating..." : "Generate"}
    </button>
    <button
      onClick={() => onExport("png")}
      className="w-full p-2 mb-2 bg-secondary text-white rounded"
      aria-label="Export as PNG"
    >
      Export PNG
    </button>
    <button
      onClick={() => onExport("interactive")}
      className="w-full p-2 mb-2 bg-secondary text-white rounded"
      aria-label="Export as interactive HTML"
    >
      Export HTML
    </button>
    <button
      onClick={() => onExampleTopic("Sample Topic")}
      className="w-full p-2 mb-2 bg-accent text-white rounded"
      aria-label="Try example topic"
    >
      Try Example
    </button>
    {isSettingsOpen && (
      <div className="mt-4">
        <label className="block mb-2">Layout:</label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as "right" | "bi")}
          className="w-full p-2 border rounded"
          aria-label="Select mind map layout"
        >
          <option value="right">Right</option>
          <option value="bi">Bi-directional</option>
        </select>
        <label className="block mt-4 mb-2">Color Scheme:</label>
        <select
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value as "default" | "vibrant" | "summer" | "monochrome")}
          className="w-full p-2 border rounded"
          aria-label="Select color scheme"
        >
          <option value="default">Default</option>
          <option value="vibrant">Vibrant</option>
          <option value="summer">Summer</option>
          <option value="monochrome">Monochrome</option>
        </select>
      </div>
    )}
  </aside>
)

// Mock MobileInput component
const MobileInput: React.FC<{
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  isGenerating: boolean
}> = ({ topic, setTopic, onGenerate, isGenerating }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-background p-4 border-t border-primary/30">
    <input
      type="text"
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      placeholder="Enter topic"
      className="w-full p-2 mb-2 border rounded"
      aria-label="Mind map topic"
    />
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className="w-full p-2 bg-primary text-white rounded disabled:opacity-50"
      aria-label="Generate mind map"
    >
      {isGenerating ? "Generating..." : "Generate"}
    </button>
  </div>
)

// Mock LoadingSpinner component
const LoadingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div
    className="animate-spin rounded-full border-4 border-primary border-t-transparent"
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
)

// Custom rendering hook
const useMindmapRenderer = ({
  markdown,
  layout,
  colorScheme,
  theme,
  isMobile,
  mindmapRef,
}: {
  markdown: string
  layout: "right" | "bi"
  colorScheme: "default" | "vibrant" | "summer" | "monochrome"
  theme: "dark" | "light"
  isMobile: boolean
  mindmapRef: React.RefObject<HTMLDivElement>
}) => {
  const { toast } = useToast()
  const parsedData = useMemo(() => parseMarkdown(markdown), [markdown])
  const zoomRef = useRef<any>(null)
  const transformRef = useRef<any>(null)

  const render = useCallback(() => {
    if (!mindmapRef.current) return

    try {
      const { zoom, svg } = renderMindmap(mindmapRef.current, parsedData, {
        layout,
        colorScheme,
        preserveTransform: transformRef.current,
        theme,
        isMobile,
      })

      svg.attr("role", "tree").attr("aria-label", "Interactive mind map")
      svg.selectAll(".mindmap-node").attr("aria-label", (d: any) => `Node: ${d.data.label}`)

      zoomRef.current = zoom
      if (!transformRef.current && svg.node()) {
        requestAnimationFrame(() => {
          transformRef.current = d3.zoomTransform(svg.node() as any)
        })
      }
    } catch (error) {
      console.error("Error rendering mindmap:", error)
      toast({
        title: "Error rendering mindmap",
        description: "Failed to render mindmap. Please try again.",
        variant: "destructive",
        action: <button onClick={() => render()} className="btn btn-secondary">Retry</button>,
      })
    }
  }, [parsedData, layout, colorScheme, theme, isMobile, toast, mindmapRef])

  useEffect(() => {
    return () => {
      if (mindmapRef.current) mindmapRef.current.innerHTML = ""
    }
  }, [mindmapRef])

  return { render, zoomRef, transformRef }
}

export const MindmapApp = () => {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const isMobile = useMobile()
  const [layout, setLayout] = useState<"right" | "bi">(isMobile ? "right" : "bi")
  const [colorScheme, setColorScheme] = useState<"default" | "vibrant" | "summer" | "monochrome">("default")
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [isSettingsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDefaultMindmap, setIsDefaultMindmap] = useState(true)
  const mindmapRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { resolvedTheme } = useTheme()
  const lastThemeRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    setMounted(true)
    const savedLayout = localStorage.getItem("mindmap-layout")
    const savedColorScheme = localStorage.getItem("mindmap-color-scheme")
    if (savedLayout) setLayout(savedLayout as "right" | "bi")
    if (savedColorScheme) setColorScheme(savedColorScheme as "default" | "vibrant" | "summer" | "monochrome")
  }, [])

  const { render: renderMindmapWithTransform, zoomRef, transformRef } = useMindmapRenderer({
    markdown,
    layout,
    colorScheme,
    theme: (resolvedTheme as "dark" | "light") || "dark",
    isMobile,
    mindmapRef,
  })

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("mindmap-layout", layout)
      localStorage.setItem("mindmap-color-scheme", colorScheme)
    }
  }, [layout, colorScheme, mounted])

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const setLayoutWithTransform = useCallback(
    (newLayout: "right" | "bi") => {
      if (layout === newLayout) return
      const currentTransform = transformRef.current
      setLayout(newLayout)
      transformRef.current = currentTransform
    },
    [layout],
  )

  const setColorSchemeWithTransform = useCallback(
    (newScheme: "default" | "vibrant" | "summer" | "monochrome") => {
      if (colorScheme === newScheme) return
      const currentTransform = transformRef.current
      setColorScheme(newScheme)
      transformRef.current = currentTransform
    },
    [colorScheme],
  )

  useEffect(() => {
    if (mounted) renderMindmapWithTransform()
  }, [renderMindmapWithTransform, mounted])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
      if (isDefaultMindmap) setLayout("right")
      transformRef.current = null
    } else {
      setIsSidebarOpen(true)
      if (isDefaultMindmap) setLayout("bi")
      transformRef.current = null
    }
    if (mounted) renderMindmapWithTransform()
  }, [isMobile, isDefaultMindmap, mounted, renderMindmapWithTransform])

  useEffect(() => {
    if (!mounted || !mindmapRef.current) return
    const observer = new ResizeObserver(() => {
      if (isDefaultMindmap) transformRef.current = null
      renderMindmapWithTransform()
    })
    observer.observe(mindmapRef.current)
    return () => observer.disconnect()
  }, [mounted, renderMindmapWithTransform, isDefaultMindmap])

  useEffect(() => {
    if (!mounted || lastThemeRef.current === resolvedTheme) return
    lastThemeRef.current = resolvedTheme as string
    renderMindmapWithTransform()
  }, [resolvedTheme, mounted, renderMindmapWithTransform])

  useEffect(() => {
    if (!mounted || !isMobile || !isSidebarOpen) return
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
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
  }, [isMobile, isSidebarOpen, mounted])

  useEffect(() => {
    if (!mounted || !zoomRef.current) return
    const handleKeydown = (e: KeyboardEvent) => {
      const svg = d3.select(mindmapRef.current).select("svg")
      if (e.key === "+") zoomRef.current.scaleBy(svg.node(), 0.9)
      if (e.key === "-") zoomRef.current.scaleBy(svg.node(), 1.1)
      if (e.key === "ArrowLeft") zoomRef.current.translateBy(svg.node(), -10, 0)
      if (e.key === "ArrowRight") zoomRef.current.translateBy(svg.node(), 10, 0)
      if (e.key === "ArrowUp") zoomRef.current.translateBy(svg.node(), 0, -10)
      if (e.key === "ArrowDown") zoomRef.current.translateBy(svg.node(), 0, 10)
      transformRef.current = d3.zoomTransform(svg.node() as any)
    }
    window.addEventListener("keydown", handleKeydown)
    return () => window.removeEventListener("keydown", handleKeydown)
  }, [mounted, zoomRef])

  const handleGenerateMindmap = async () => {
    const MAX_CHARS = 90
    const sanitizedTopic = sanitizeHtml(topic, { allowedTags: [] })

    if (!sanitizedTopic.trim()) {
      toast({
        title: "Topic is required",
        description: "Please enter a topic to generate a mindmap",
        variant: "destructive",
      })
      return
    }

    if (sanitizedTopic.length > MAX_CHARS) {
      toast({
        title: "Topic too long",
        description: `Please limit your topic to ${MAX_CHARS} characters or less`,
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    if (isMobile) setIsSidebarOpen(false)
    if (mindmapRef.current) mindmapRef.current.innerHTML = ""

    try {
      transformRef.current = null
      const generatedMarkdown = await generateMindmapMarkdown(sanitizedTopic)
      setMarkdown(generatedMarkdown)
      setIsDefaultMindmap(false)
      toast({
        title: "Mind map generated",
        description: `Mind map for "${sanitizedTopic}" has been created`,
      })
    } catch (error) {
      console.error("Error generating mindmap:", error)
      toast({
        title: "Error generating mind map",
        description: error instanceof Error ? error.message : "Failed to generate mind map.",
        variant: "destructive",
        action: <button onClick={() => handleGenerateMindmap()} className="btn btn-secondary">Retry</button>,
      })
      renderMindmapWithTransform()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: "png" | "interactive") => {
    if (!mindmapRef.current) return

    try {
      const currentTheme = (resolvedTheme as "dark" | "light") || "dark"
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      document.body.appendChild(tempContainer)

      const data = parseMarkdown(markdown)
      const { svg } = renderMindmap(tempContainer, data, {
        layout,
        colorScheme,
        preserveTransform: null,
        theme: currentTheme,
        isMobile,
        forExport: true,
      })

      const gElement = svg.node()?.querySelector("g")
      if (!gElement) throw new Error("Failed to find content for export")

      const bbox = gElement.getBBox()
      const padding = 100
      const width = bbox.width + padding * 2
      const height = bbox.height + padding * 2
      const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`

      svg.attr("viewBox", viewBox).attr("width", width).attr("height", height)

      const style = document.createElement("style")
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        .mindmap-node-text { font-family: 'Inter', sans-serif; font-weight: 500; }
        .mindmap-node-text.depth-0 { font-size: 18px; font-weight: 700; }
        .mindmap-node-text.depth-1 { font-size: 16px; font-weight: 700; }
        .mindmap-node-text.depth-2 { font-size: 14px; font-weight: 500; }
      `
      svg.node()?.prepend(style)

      if (format === "interactive") {
        const svgData = new XMLSerializer().serializeToString(svg.node()!)
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mindmap: ${sanitizeHtml(topic || "Mindmap")} | Mind-Map-Maker.com</title>
            <style>
              body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: ${currentTheme === "dark" ? "#1a1a1a" : "#fff"}; }
              #svg-container { width: 100%; height: 100%; }
              svg { width: 100%; height: 100%; cursor: grab; }
              svg:active { cursor: grabbing; }
              .controls { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; }
              .control-button { width: 40px; height: 40px; border-radius: 50%; background: ${currentTheme === "dark" ? "#333" : "#f0f0f0"}; border: none; cursor: pointer; }
              .zoom-level { position: fixed; bottom: 20px; left: 20px; background: ${currentTheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)"}; padding: 5px 10px; border-radius: 15px; }
            </style>
          </head>
          <body>
            <div id="svg-container">${svgData}</div>
            <div class="controls">
              <button class="control-button" id="zoom-in">+</button>
              <button class="control-button" id="zoom-out">-</button>
              <button class="control-button" id="reset">⟲</button>
            </div>
            <div class="zoom-level" id="zoom-level">100%</div>
            <script>
              const svg = document.querySelector('svg');
              const zoomLevelDisplay = document.getElementById('zoom-level');
              let currentViewBox = [${viewBox.split(" ").join(",")}];
              let zoomLevel = 1;

              function updateZoomLevel() {
                zoomLevelDisplay.textContent = \`\${Math.round(zoomLevel * 100)}%\`;
              }

              svg.addEventListener('wheel', (e) => {
                e.preventDefault();
                const factor = 1 + Math.sign(e.deltaY) * 0.1;
                zoomLevel /= factor;
                currentViewBox = [
                  currentViewBox[0] + (e.clientX / window.innerWidth) * currentViewBox[2] * (1 - factor),
                  currentViewBox[1] + (e.clientY / window.innerHeight) * currentViewBox[3] * (1 - factor),
                  currentViewBox[2] * factor,
                  currentViewBox[3] * factor,
                ];
                svg.setAttribute('viewBox', currentViewBox.join(' '));
                updateZoomLevel();
              });

              document.getElementById('zoom-in').addEventListener('click', () => {
                zoomLevel /= 0.9;
                currentViewBox[2] *= 0.9;
                currentViewBox[3] *= 0.9;
                svg.setAttribute('viewBox', currentViewBox.join(' '));
                updateZoomLevel();
              });

              document.getElementById('zoom-out').addEventListener('click', () => {
                zoomLevel /= 1.1;
                currentViewBox[2] *= 1.1;
                currentViewBox[3] *= 1.1;
                svg.setAttribute('viewBox', currentViewBox.join(' '));
                updateZoomLevel();
              });

              document.getElementById('reset').addEventListener('click', () => {
                currentViewBox = [${viewBox.split(" ").join(",")}];
                zoomLevel = 1;
                svg.setAttribute('viewBox', currentViewBox.join(' '));
                updateZoomLevel();
              });

              updateZoomLevel();
            </script>
          </body>
          </html>
        `
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `mindmap-${sanitizeHtml(topic || "export")}.html`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "png") {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Failed to create canvas context")

        const scale = 2
        canvas.width = width * scale
        canvas.height = height * scale

        const svgData = new XMLSerializer().serializeToString(svg.node()!)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.fillStyle = currentTheme === "dark" ? "#1a1a1a" : "#fff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0, width, height)
          ctx.scale(1 / scale, 1 / scale)
          ctx.font = `${10 * scale}px Arial`
          ctx.fillStyle = currentTheme === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"
          ctx.textAlign = "right"
          ctx.fillText("mind-map-maker.com", canvas.width - 10, canvas.height - 10)

          const pngUrl = canvas.toDataURL("image/png", 1.0)
          const a = document.createElement("a")
          a.href = pngUrl
          a.download = `mindmap-${sanitizeHtml(topic || "export")}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
        img.onerror = () => {
          throw new Error("Failed to load SVG for PNG export")
        }
        img.src = url
      }

      setTimeout(() => {
        if (document.body.contains(tempContainer)) document.body.removeChild(tempContainer)
      }, 2000)

      toast({
        title: format === "interactive" ? "Interactive HTML exported" : "PNG exported",
        description: "Your mindmap has been exported successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: `Failed to export as ${format === "interactive" ? "HTML" : "PNG"}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleExampleTopic = (exampleTopic: string) => {
    const sanitizedTopic = sanitizeHtml(exampleTopic, { allowedTags: [] })
    setTopic(sanitizedTopic)
    transformRef.current = null

    setTimeout(() => {
      setIsGenerating(true)
      if (isMobile) setIsSidebarOpen(false)
      if (mindmapRef.current) mindmapRef.current.innerHTML = ""

      generateMindmapMarkdown(sanitizedTopic)
        .then((generatedMarkdown) => {
          setMarkdown(generatedMarkdown)
          setIsDefaultMindmap(false)
          toast({
            title: "Mind map generated",
            description: `Mind map for "${sanitizedTopic}" has been created`,
          })
        })
        .catch((error) => {
          console.error("Error generating mindmap:", error)
          toast({
            title: "Error generating mind map",
            description: error instanceof Error ? error.message : "Failed to generate mind map.",
            variant: "destructive",
            action: <button onClick={() => handleExampleTopic(sanitizedTopic)} className="btn btn-secondary">Retry</button>,
          })
          renderMindmapWithTransform()
        })
        .finally(() => setIsGenerating(false))
    }, 0)
  }

  const handleTopicChange = useCallback((newTopic: string) => {
    setTopic(newTopic)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingSpinner size={60} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen mobile-container flex-grow">
      <Header toggleSidebar={handleToggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
        <div
          ref={sidebarRef}
          className={`z-30 md:z-auto transition-all duration-300 ${isSidebarOpen ? "w-80" : "w-0 overflow-hidden"}`}
        >
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
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={mindmapRef}
            className="w-full h-full overflow-hidden pb-16 md:pb-0 border-b border-primary/30 dark:border-primary/40"
            tabIndex={0}
            role="region"
            aria-label="Mind map canvas"
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size={60} />
                <p className="text-lg font-medium text-primary">Generating your mind map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
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
