"use client"

import { useSession } from "@/contexts/session-context"
import { useSidebar } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SessionHeader() {
  const { activeSession } = useSession()
  const { isOpen, toggleSidebar } = useSidebar()

  // Get icon for session type
  const getSessionIcon = (type: string) => {
    switch (type) {
      case "notes":
        return <BookOpen className="h-5 w-5" />
      case "flashcards":
        return <BookOpen className="h-5 w-5" />
      case "research":
        return <Search className="h-5 w-5" />
      case "summary":
        return <BookOpen className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-foreground hover:bg-muted hover:text-foreground mr-1"
          >
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            {activeSession && getSessionIcon(activeSession.type)}
            <h1 className="text-2xl font-bold tracking-tight">{activeSession ? activeSession.name : "minimaLLM"}</h1>
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}
