"use client"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

interface MobileInputProps {
  topic: string
  setTopic: (topic: string) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function MobileInput({ topic, setTopic, onGenerate, isGenerating }: MobileInputProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t border-border z-20 md:hidden">
      <div className="flex gap-2">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic... e.g., personal finance"
          className="flex-1"
        />
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  )
}
