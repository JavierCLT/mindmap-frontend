"use client"

import type React from "react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useState, useEffect } from "react"

interface MobileInputProps {
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function MobileInput({ topic, setTopic, onGenerate, isGenerating }: MobileInputProps) {
  const MAX_CHARS = 90
  const [charCount, setCharCount] = useState(0)

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
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t border-border z-20 md:hidden">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={topic}
            onChange={handleInputChange}
            placeholder="Enter a topic... e.g., how to budget"
            className="w-full text-sm"
            maxLength={MAX_CHARS}
          />
        </div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating || charCount === 0 || charCount > MAX_CHARS}
          className="bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  )
}
