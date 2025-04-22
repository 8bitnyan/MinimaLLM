"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import TextSummarizer from "@/components/text-summarizer"
import FlashcardGenerator from "@/components/flashcard-generator"
import WebSearch from "@/components/web-search"
import ResearchPlanner from "@/components/research-planner"
import DocumentUploader from "@/components/document-uploader"
import { SessionSidebar } from "@/components/session-sidebar"
import { SessionHeader } from "@/components/session-header"
import { useSidebar } from "@/components/ui/sidebar"
import { useAppRouter } from "@/components/app-router"
import { AlertTriangle, WifiOff, ClipboardEdit, PenLine, BookOpen, Search, FolderOpen, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ChatMessages, ChatInputForm } from "@/components/chat/chat-interface"

export default function Dashboard() {
  const { navigate } = useAppRouter()
  const { isAuthenticated, loading, isOffline, user } = useAuth()
  const { open } = useSidebar()
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const widgetHeight = 350 // Reduced height for widgets to make room for chat input
  const mountedRef = useRef(true);
  const toolbarHeight = 58; // Adjusted height of the input toolbar
  const widgetBarHeight = 52; // Height of the widget toolbar

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }

    // Cleanup function to ensure proper unmounting
    return () => {
      // Only log if the component is actually unmounting from the DOM
      // not just due to internal React re-renders
      if (mountedRef.current) {
        console.log("Dashboard page unmounted")
        mountedRef.current = false;
      }
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

  // Function to render active widget
  const renderActiveWidget = () => {
    switch (activeWidget) {
      case "summarizer":
        return <TextSummarizer />
      case "flashcards":
        return <FlashcardGenerator />
      case "search":
        if (isOffline) {
          return (
            <div className="p-8 text-center">
              <WifiOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Web Search Unavailable</h3>
              <p className="text-muted-foreground">
                This feature requires an internet connection. Please connect to the internet to use web search.
              </p>
            </div>
          )
        }
        return <WebSearch />
      case "research":
        return <ResearchPlanner />
      case "documents":
        return <DocumentUploader />
      default:
        return null
    }
  }

  return (
    <div
      className="grid h-screen overflow-hidden bg-background text-foreground"
      style={{
        gridTemplateColumns: open ? "var(--sidebar-width) 1fr" : "var(--collapsed-sidebar-width) 1fr",
        gridTemplateRows: "auto 1fr auto auto", // Header, content, widget bar, input bar
      }}
    >
      {/* Sidebar - should take exactly the width specified in the sidebar component */}
      <div className="col-span-1 row-span-4 z-sidebar">
        <SessionSidebar />
      </div>

      {/* Header */}
      <div className="col-start-2 row-start-1 z-header">
        <SessionHeader />
      </div>

      {/* Main Content Area - Only contains chat messages */}
      <div className="col-start-2 row-start-2 overflow-hidden z-content">
        {isOffline && (
          <Alert className="m-4 mb-0" variant="warning">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Some features may be limited or unavailable until you reconnect to the internet.
            </AlertDescription>
          </Alert>
        )}
        
        {isDemoUser && (
          <Alert className="mx-4 mt-4 mb-0" variant="info">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Demo Mode</AlertTitle>
            <AlertDescription>
              You are using a demo account. Your data will not be saved between sessions.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Chat Messages Container */}
        <div className="h-full overflow-auto">
          <ChatMessages />
        </div>
      </div>
      
      {/* Widget Button Bar - Fixed 3rd row in grid */}
      <div className="col-start-2 row-start-3 border-t border-border bg-background py-2 px-4 flex flex-wrap items-center justify-center gap-2 z-30">
        <p className="text-sm text-muted-foreground mr-2">Widgets:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveWidget("summarizer")}
            className="flex items-center space-x-1"
          >
            <ClipboardEdit className="h-4 w-4" />
            <span>Summarizer</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveWidget("flashcards")}
            className="flex items-center space-x-1"
          >
            <PenLine className="h-4 w-4" />
            <span>Flashcards</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveWidget("search")}
            disabled={isOffline}
            className="flex items-center space-x-1"
          >
            <Search className="h-4 w-4" />
            <span>Web Search</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveWidget("research")}
            className="flex items-center space-x-1"
          >
            <BookOpen className="h-4 w-4" />
            <span>Research</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveWidget("documents")}
            className="flex items-center space-x-1"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Documents</span>
          </Button>
        </div>
      </div>
      
      {/* Chat Input Bar - Fixed 4th row in grid */}
      <div className="col-start-2 row-start-4 z-20">
        <ChatInputForm />
      </div>
      
      {/* Widget Panel - Absolutely positioned over main content when active */}
      {activeWidget && (
        <div 
          className="absolute left-0 right-0 bottom-0 bg-background border-t border-border rounded-t-lg shadow-lg z-40"
          style={{ 
            height: `${widgetHeight}px`,
            left: open ? "var(--sidebar-width)" : "var(--collapsed-sidebar-width)",
            bottom: `${toolbarHeight + widgetBarHeight}px`,
          }}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-bold">
              {activeWidget === "summarizer" && "Text Summarizer"}
              {activeWidget === "flashcards" && "Flashcard Generator"}
              {activeWidget === "search" && "Web Search"}
              {activeWidget === "research" && "Research Planner"}
              {activeWidget === "documents" && "Document Uploader"}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setActiveWidget(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 overflow-auto" style={{ height: `calc(${widgetHeight}px - 4rem)` }}>
            {renderActiveWidget()}
          </div>
        </div>
      )}
    </div>
  )
} 