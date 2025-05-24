"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Lightbulb, Target, Users, Zap, BookOpen } from "lucide-react"

export default function HowToPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">How to Create Effective Mind Maps</h1>
          <p className="text-xl text-muted-foreground">
            Learn the art and science of mind mapping to organize your thoughts, boost creativity, and enhance learning.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                1. Start with a Clear Central Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Begin with a single, focused central idea in the middle of your mind map. This should be your main topic
                or question.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use a clear, concise phrase or single word
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Make it specific and actionable
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Avoid overly broad or vague topics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                2. Branch Out Logically
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create main branches that represent key categories or themes related to your central topic.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use 3-7 main branches for optimal clarity
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Keep branch labels short and descriptive
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Ensure branches are mutually exclusive
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                3. Add Supporting Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Expand each main branch with sub-branches containing specific details, examples, or action items.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use keywords rather than full sentences
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Include concrete examples and data
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Maintain hierarchical organization
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                4. Keep It Visual and Engaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Use visual elements to make your mind map more memorable and easier to understand.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Use colors to group related concepts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Vary text sizes for emphasis
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Keep the layout clean and uncluttered
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Best Practices for Mind Mapping
            </CardTitle>
            <CardDescription>Follow these proven strategies to create more effective mind maps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Do:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Start with brainstorming before organizing</li>
                  <li>• Use single words or short phrases</li>
                  <li>• Review and refine your mind map</li>
                  <li>• Share and collaborate with others</li>
                  <li>• Use mind maps for different purposes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Don't:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Overcomplicate with too many branches</li>
                  <li>• Use full sentences or paragraphs</li>
                  <li>• Make it too dense or cluttered</li>
                  <li>• Ignore the logical flow of ideas</li>
                  <li>• Forget to update as ideas evolve</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Ready to Create Your First Mind Map?</h3>
          <p className="text-muted-foreground mb-4">
            Put these principles into practice by creating your own mind map. Start with a topic you're passionate about
            or a problem you're trying to solve.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Start Creating →
          </a>
        </div>
      </main>
    </div>
  )
}
