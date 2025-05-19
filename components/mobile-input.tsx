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
            placeholder="Enter a topic... e.g., personal finance"
            className="w-full pr-16"
            maxLength={MAX_CHARS}
          />
          <div
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs ${charCount >= MAX_CHARS ? "text-red-500 font-bold" : charCount > MAX_CHARS * 0.8 ? "text-amber-500" : "text-muted-foreground"}`}
          >
            {charCount}/{MAX_CHARS}
          </div>
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
