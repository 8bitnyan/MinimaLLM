"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { summarizeText } from "@/lib/ai-actions"

export default function TextSummarizer() {
  const [inputText, setInputText] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSummarize = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await summarizeText(inputText)
      setSummary(result)
    } catch (error) {
      console.error("Error summarizing text:", error)
      setSummary("An error occurred while summarizing the text. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4 mt-4">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Text Summarizer</h3>
        <p className="text-sm text-muted-foreground">Paste your text below to generate a concise summary.</p>
      </div>

      <div className="grid gap-4">
        <Textarea
          placeholder="Paste your text here..."
          className="min-h-[200px] bg-muted text-foreground placeholder:text-muted-foreground"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <Button
          onClick={handleSummarize}
          disabled={!inputText.trim() || isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize"
          )}
        </Button>
      </div>

      {summary && (
        <Card className="bg-card text-card-foreground mt-4">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <div className="p-4 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
