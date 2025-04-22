"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextSummarizer from "@/components/text-summarizer"
import FlashcardGenerator from "@/components/flashcard-generator"
import WebSearch from "@/components/web-search"
import ResearchPlanner from "@/components/research-planner"
import DocumentUploader from "@/components/document-uploader"
import { SessionSidebar } from "@/components/session-sidebar"
import { SessionHeader } from "@/components/session-header"
import { useSidebar } from "@/components/ui/sidebar"
import { useAppRouter } from "@/components/app-router"
import { WifiOff, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Dashboard() {
  const { navigate } = useAppRouter()
  const { isAuthenticated, loading, isOffline, user } = useAuth()
  const { open } = useSidebar()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, loading, navigate])

  // Don't render anything while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render the dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Determine if user is in demo mode
  const isDemoUser = user?.email === 'demo@example.com'

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
          {isOffline && (
            <Alert className="mb-4" variant="warning">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>You are offline</AlertTitle>
              <AlertDescription>
                Some features may be limited or unavailable until you reconnect to the internet.
              </AlertDescription>
            </Alert>
          )}
          
          {isDemoUser && (
            <Alert className="mb-4" variant="info">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Demo Mode</AlertTitle>
              <AlertDescription>
                You are using a demo account. Your data will not be saved between sessions.
              </AlertDescription>
            </Alert>
          )}
          
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
              <TabsTrigger value="search" disabled={isOffline}>🔍 Web Search</TabsTrigger>
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
              {isOffline ? (
                <div className="p-8 text-center">
                  <WifiOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Web Search Unavailable</h3>
                  <p className="text-muted-foreground">
                    This feature requires an internet connection. Please connect to the internet to use web search.
                  </p>
                </div>
              ) : (
                <WebSearch />
              )}
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