"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { generateResearchPlan } from "@/lib/ai-actions"

export default function ResearchPlanner() {
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [plan, setPlan] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGeneratePlan = async () => {
    if (!topic.trim()) return

    setIsLoading(true)
    try {
      const result = await generateResearchPlan(topic, description)
      setPlan(result)
    } catch (error) {
      console.error("Error generating research plan:", error)
      setPlan("An error occurred while generating the research plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Research & Project Planning</h3>
        <p className="text-sm text-muted-foreground">Generate structured research plans and project outlines.</p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-medium">
            Research Topic
          </label>
          <Input
            id="topic"
            placeholder="Enter your research topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Additional Details (Optional)
          </label>
          <Textarea
            id="description"
            placeholder="Describe your research goals, target audience, timeline, etc..."
            className="min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button onClick={handleGeneratePlan} disabled={!topic.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            "Generate Research Plan"
          )}
        </Button>
      </div>

      {plan && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-lg font-medium mb-2">Research Plan</h4>
            <div className="p-4 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{plan}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
