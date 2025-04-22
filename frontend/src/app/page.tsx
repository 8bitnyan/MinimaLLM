"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextSummarizer from "@/components/text-summarizer"
import FlashcardGenerator from "@/components/flashcard-generator"
import WebSearch from "@/components/web-search"
import ResearchPlanner from "@/components/research-planner"
import DocumentUploader from "@/components/document-uploader"
import { SessionSidebar } from "@/components/session-sidebar"
import { SessionHeader } from "@/components/session-header"
import { useSidebar } from "@/components/ui/sidebar"

export default function Home() {
  const { open } = useSidebar()

  return (
    <div
      className="grid h-screen overflow-hidden bg-background text-foreground"
      style={{
        gridTemplateColumns: open ? "auto 1fr" : "auto 1fr",
        gridTemplateRows: "1fr",
      }}
    >
      {/* Sidebar */}
      <SessionSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full">
        <SessionHeader />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Your AI-Powered Study & Research Assistant</h2>
            <p className="text-muted-foreground">
              Study smarter, not harder with AI-powered tools for learning, researching, and building projects.
            </p>
          </div>

          <Tabs defaultValue="summarizer" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted text-muted-foreground">
              <TabsTrigger value="summarizer">📝 Summarizer</TabsTrigger>
              <TabsTrigger value="flashcards">💡 Flashcards</TabsTrigger>
              <TabsTrigger value="search">🔍 Web Search</TabsTrigger>
              <TabsTrigger value="research">🧭 Research</TabsTrigger>
              <TabsTrigger value="documents">📂 Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="summarizer">
              <TextSummarizer />
            </TabsContent>
            <TabsContent value="flashcards">
              <FlashcardGenerator />
            </TabsContent>
            <TabsContent value="search">
              <WebSearch />
            </TabsContent>
            <TabsContent value="research">
              <ResearchPlanner />
            </TabsContent>
            <TabsContent value="documents">
              <DocumentUploader />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
