"use client"

import React, { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import TextSummarizer from "@/components/text-summarizer"
import FlashcardGenerator from "@/components/flashcard-generator"
import WebSearch, { SearchResultData } from "@/components/web-search"
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
import { useMessageService } from "@/lib/message-service"
import { useSession } from "@/contexts/session-context"

// Widget result types
interface SummarizerResult {
  summary: string;
  originalText: string;
}

interface FlashcardResult {
  cards: {
    question: string;
    answer: string;
  }[];
}

interface ResearchResult {
  outline: string;
  topics: string[];
}

interface DocumentResult {
  fileName: string;
  content: string;
  summary?: string;
}

// Temporary interface declarations until proper props are defined in the components
interface TextSummarizerProps {
  onResults: (data: SummarizerResult) => void;
}

interface FlashcardGeneratorProps {
  onResults: (data: FlashcardResult) => void;
}

interface ResearchPlannerProps {
  onResults: (data: ResearchResult) => void;
}

interface DocumentUploaderProps {
  onResults: (data: DocumentResult) => void;
}

// Augment existing component types
declare module "@/components/text-summarizer" {
  export default function TextSummarizer(props: TextSummarizerProps): React.ReactElement;
}

declare module "@/components/flashcard-generator" {
  export default function FlashcardGenerator(props: FlashcardGeneratorProps): React.ReactElement;
}

declare module "@/components/research-planner" {
  export default function ResearchPlanner(props: ResearchPlannerProps): React.ReactElement;
}

declare module "@/components/document-uploader" {
  export default function DocumentUploader(props: DocumentUploaderProps): React.ReactElement;
}

export default function Dashboard() {
  const { navigate } = useAppRouter()
  const { isAuthenticated, loading, isOffline, user } = useAuth()
  const { open } = useSidebar()
  const { activeSessionId } = useSession()
  const messageService = useMessageService()
  const [activeWidget, setActiveWidget] = useState<string | null>(null)
  const widgetHeight = 350 // Reduced height for widgets to make room for chat input
  const mountedRef = useRef(true);
  const toolbarHeight = 58; // Adjusted height of the input toolbar
  const widgetBarHeight = 52; // Height of the widget toolbar

  // Function to handle widget results
  const handleWidgetResults = (type: string, data: unknown) => {
    // Only process if we have an active session
    if (!activeSessionId || !user) {
      alert("Please create or select a chat session first");
      return;
    }
    
    // Create a message with the widget results
    let content = '';
    
    switch (type) {
      case "search":
        {
          const searchData = data as SearchResultData;
          content = `Search Results for: "${searchData.answer.substring(0, 50)}..."`;
        }
        break;
      case "summarizer":
        {
          const summaryData = data as SummarizerResult;
          content = `Text summary: "${summaryData.summary.substring(0, 50)}..."`;
        }
        break;
      case "flashcards":
        {
          const flashcardData = data as FlashcardResult;
          content = `Generated ${flashcardData.cards.length} flashcards`;
        }
        break;
      case "research":
        {
          const researchData = data as ResearchResult;
          content = `Research plan created for: ${researchData.outline.substring(0, 50)}...`;
        }
        break;
      case "documents":
        {
          const docData = data as DocumentResult;
          content = `Document processed: ${docData.fileName}`;
        }
        break;
      default:
        content = `Used ${type} widget`;
    }
    
    // Create visualization based on the widget type
    const visualization = createVisualization(type, data);
    
    // Send message with visualization directly
    messageService.sendUserMessage({
      content,
      visualization
    });
    
    // Close the widget after sending results to chat
    setActiveWidget(null);
  };
  
  // Function to create visualization components
  const createVisualization = (type: string, data: unknown) => {
    if (type === "search") {
      const searchData = data as SearchResultData;
      return (
        <div className="space-y-4">
          {searchData.answer && (
            <div className="p-4 bg-muted rounded-md">
              <h4 className="text-md font-medium mb-2">Web Search Answer</h4>
              <p className="whitespace-pre-wrap">{searchData.answer}</p>
            </div>
          )}
          {searchData.results && searchData.results.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">Search Results</h4>
              <div className="space-y-2">
                {searchData.results.map((result, i) => (
                  <div key={i} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <h5 className="text-sm font-medium">{result.title}</h5>
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        Visit
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (type === "summarizer") {
      const summaryData = data as SummarizerResult;
      return (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <h4 className="text-md font-medium mb-2">Summary</h4>
            <p className="whitespace-pre-wrap">{summaryData.summary}</p>
          </div>
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Original Text</summary>
            <div className="p-2 mt-2 bg-muted/50 rounded-md max-h-48 overflow-y-auto">
              <p className="whitespace-pre-wrap">{summaryData.originalText}</p>
            </div>
          </details>
        </div>
      );
    }
    
    if (type === "flashcards") {
      const flashcardData = data as FlashcardResult;
      return (
        <div className="space-y-4">
          <h4 className="text-md font-medium mb-2">Flashcards</h4>
          <div className="space-y-2">
            {flashcardData.cards.map((card, i) => (
              <details key={i} className="p-3 border rounded-md">
                <summary className="cursor-pointer font-medium">{card.question}</summary>
                <div className="p-2 mt-2 bg-muted/50 rounded-md">
                  <p className="whitespace-pre-wrap">{card.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

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
        return <TextSummarizer onResults={(data: SummarizerResult) => 
          handleWidgetResults("summarizer", data)} 
        />
      case "flashcards":
        return <FlashcardGenerator onResults={(data: FlashcardResult) => 
          handleWidgetResults("flashcards", data)}
        />
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
        return <WebSearch onResults={(data: SearchResultData) => 
          handleWidgetResults("search", data)}
        />
      case "research":
        return <ResearchPlanner onResults={(data: ResearchResult) => 
          handleWidgetResults("research", data)}
        />
      case "documents":
        return <DocumentUploader onResults={(data: DocumentResult) => 
          handleWidgetResults("documents", data)}
        />
      default:
        return null
    }
  }

  return (
    <div
      className={`grid h-screen overflow-hidden bg-background text-foreground ${open ? 'grid-full-width' : 'grid-full-width-collapsed'}`}
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
      <div className="col-start-2 row-start-1 z-header w-full max-w-full">
        <SessionHeader />
      </div>

      {/* Main Content Area - Only contains chat messages */}
      <div className="col-start-2 row-start-2 overflow-hidden z-content w-full max-w-full h-full">
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
        <div className="h-full w-full overflow-auto">
          <ChatMessages />
        </div>
      </div>
      
      {/* Widget Button Bar - Fixed 3rd row in grid */}
      <div className="col-start-2 row-start-3 border-t border-border bg-background py-2 px-4 flex flex-wrap items-center justify-center gap-2 z-30 w-full max-w-full">
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
      <div className="col-start-2 row-start-4 z-20 w-full max-w-full">
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