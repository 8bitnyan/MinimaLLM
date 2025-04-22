"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { generateFlashcards } from "@/lib/ai-actions"

interface Flashcard {
  question: string
  answer: string
}

export default function FlashcardGenerator() {
  const [inputText, setInputText] = useState("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    try {
      const result = await generateFlashcards(inputText)
      setFlashcards(result)
      setCurrentCardIndex(0)
      setShowAnswer(false)
    } catch (error) {
      console.error("Error generating flashcards:", error)
      setFlashcards([])
    } finally {
      setIsLoading(false)
    }
  }

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Flashcard Generator</h3>
        <p className="text-sm text-muted-foreground">
          Paste your study material to generate flashcards for active recall learning.
        </p>
      </div>

      <div className="grid gap-4">
        <Textarea
          placeholder="Paste your study material here..."
          className="min-h-[200px]"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <Button onClick={handleGenerateFlashcards} disabled={!inputText.trim() || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Flashcards...
            </>
          ) : (
            "Generate Flashcards"
          )}
        </Button>
      </div>

      {flashcards.length > 0 && (
        <div className="space-y-4">
          <Card className="min-h-[300px] flex flex-col">
            <CardContent className="flex flex-col items-center justify-center flex-1 p-6">
              <div className="text-sm text-muted-foreground mb-2">
                Card {currentCardIndex + 1} of {flashcards.length}
              </div>

              <div
                className="w-full h-full flex flex-col items-center justify-center text-center p-4 cursor-pointer"
                onClick={toggleAnswer}
              >
                <div className="text-xl font-medium mb-4">{flashcards[currentCardIndex].question}</div>

                {showAnswer && (
                  <div className="mt-6 p-4 bg-muted rounded-md w-full">
                    <p>{flashcards[currentCardIndex].answer}</p>
                  </div>
                )}

                {!showAnswer && (
                  <Button variant="outline" className="mt-6" onClick={toggleAnswer}>
                    Show Answer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevCard} disabled={currentCardIndex === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button variant="outline" onClick={nextCard} disabled={currentCardIndex === flashcards.length - 1}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
