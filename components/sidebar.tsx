"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Download, FileImage } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface SidebarProps {
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  onExport: (format: "png" | "interactive") => void
  isGenerating: boolean
  onExampleTopic: (topic: string) => void
  isSettingsOpen: boolean
  layout: "right" | "bi" // Updated to only include right and bi
  setLayout: (layout: "right" | "bi") => void
  colorScheme: "default" | "vibrant" | "summer" | "monochrome"
  setColorScheme: (scheme: "default" | "vibrant" | "summer" | "monochrome") => void
}

export function Sidebar({
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
}: SidebarProps) {
  const MAX_CHARS = 90
  const [charCount, setCharCount] = useState(0)

  // Updated example topics
  const exampleTopics = ["personal finance", "career tips", "plan trip", "learn about ai"]

  // Color scheme preview swatches
  const colorSwatches = {
    default: ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
    vibrant: ["#EF476F", "#FFD166", "#118AB2", "#06D6A0"],
    summer: ["#70D6FF", "#FF70A6", "#FFD670", "#E9FF70"],
    monochrome: ["#00A6FB", "#0582CA", "#006494", "#003554"],
  }

  // Update character count when topic changes
  useEffect(() => {
    setCharCount(topic.length)
  }, [topic])

  // Handle input change with character limit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS) {
      setTopic(newValue)
    }
  }

  return (
    <div className="w-80 min-w-[20rem] border-r border-border bg-card p-4 overflow-y-auto h-full">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Generate a Mind Map</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Enter a topic
            </label>
            <div className="relative">
              <Input
                id="topic"
                value={topic}
                onChange={handleInputChange}
                placeholder="e.g., how to budget"
                maxLength={MAX_CHARS}
                style={{ fontSize: "16px" }} // Add explicit font size to prevent zoom
              />
            </div>
          </div>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={onGenerate}
            disabled={isGenerating || charCount === 0 || charCount > MAX_CHARS}
          >
            {isGenerating ? "Generating..." : "Generate Mind Map"}
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Example topics:</p>
            <div className="grid grid-cols-2 gap-2">
              {exampleTopics.map((exampleTopic) => (
                <Button
                  key={exampleTopic}
                  variant="outline"
                  size="sm"
                  onClick={() => onExampleTopic(exampleTopic)}
                  className="text-xs px-2 py-1 h-auto min-h-[2.5rem] justify-center text-center"
                >
                  {exampleTopic}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="pt-4 space-y-6">
          <RadioGroup
            value={layout}
            onValueChange={(value) => setLayout(value as any)}
            className="flex justify-between w-full"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="right" />
              <Label htmlFor="right">Right</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bi" id="bi" />
              <Label htmlFor="bi">Bidirectional</Label>
            </div>
          </RadioGroup>

          <Select value={colorScheme} onValueChange={(value) => setColorScheme(value as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a color scheme" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(colorSwatches).map(([scheme, colors]) => (
                <SelectItem key={scheme} value={scheme}>
                  <div className="flex items-center">
                    <span className="mr-2">{scheme.charAt(0).toUpperCase() + scheme.slice(1)}</span>
                    <div className="flex ml-auto">
                      {colors.map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm ml-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium">Export Options:</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => onExport("interactive")}
            className="flex items-center justify-center"
          >
            <Download className="mr-2 h-4 w-4" />
            HTML
          </Button>
          <Button variant="outline" onClick={() => onExport("png")} className="flex items-center justify-center">
            <FileImage className="mr-2 h-4 w-4" />
            PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
