"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, SendToBack } from "lucide-react"
import { searchWeb } from "@/lib/ai-actions"

export interface SearchResultItem {
  title: string
  url: string
  snippet: string
}

export interface SearchResultData {
  answer: string
  results: SearchResultItem[]
}

export interface WebSearchProps {
  onResults?: (data: SearchResultData) => void
}

export default function WebSearch({ onResults }: WebSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const { results: searchResults, answer: aiAnswer } = await searchWeb(query)
      setResults(searchResults)
      setAnswer(aiAnswer)
    } catch (error) {
      console.error("Error searching:", error)
      setResults([])
      setAnswer("An error occurred while searching. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSendToChat = () => {
    if (onResults && (answer || results.length > 0)) {
      onResults({
        answer,
        results
      });
    }
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">AI-Powered Web Search</h3>
        <p className="text-sm text-muted-foreground">Search the web with AI-enhanced results and summaries.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Enter your search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!query.trim() || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Searching the web...</span>
        </div>
      )}

      {(answer || results.length > 0) && !isLoading && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSendToChat}
            className="flex items-center gap-2"
          >
            <SendToBack className="h-4 w-4" />
            Use in Chat
          </Button>
        </div>
      )}

      {answer && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-lg font-medium mb-2">AI Answer</h4>
            <div className="p-4 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !isLoading && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium">Search Results</h4>
          {results.map((result, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <h5 className="text-md font-medium">{result.title}</h5>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{result.snippet}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
