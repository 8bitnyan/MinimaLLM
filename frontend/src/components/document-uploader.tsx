"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, FileText, X } from "lucide-react"
import { extractTextFromDocument } from "@/lib/ai-actions"

export default function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setExtractedText("")
  }

  const handleExtractText = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const result = await extractTextFromDocument(file)
      setExtractedText(result)
    } catch (error) {
      console.error("Error extracting text:", error)
      setExtractedText("An error occurred while extracting text from the document. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setExtractedText("")
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h3 className="text-xl font-medium">Document Upload & Parsing</h3>
        <p className="text-sm text-muted-foreground">
          Upload documents to extract content for summarization or flashcard generation.
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Drag & drop your file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT files</p>
              <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-primary mr-2" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleExtractText} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Extract Text"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {extractedText && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-lg font-medium mb-2">Extracted Text</h4>
            <div className="p-4 bg-muted rounded-md max-h-[400px] overflow-y-auto">
              <p className="whitespace-pre-wrap">{extractedText}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(extractedText)}>
                Copy Text
              </Button>
              <Button variant="outline" onClick={() => setExtractedText("")}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
