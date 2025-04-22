"use client"

import { useSession } from "@/contexts/session-context"
import { useSidebar } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SessionHeader() {
  const { activeSession } = useSession()
  const { open, toggleSidebar } = useSidebar()

  // Get icon for session type
  const getSessionIcon = () => {
    // Default to BookOpen icon
    return <BookOpen className="h-5 w-5" />
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-header px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-foreground hover:bg-muted hover:text-foreground mr-1"
          >
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            {activeSession && getSessionIcon()}
            <h1 className="text-2xl font-bold tracking-tight">{activeSession ? activeSession.title : "minimaLLM"}</h1>
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
  )
}
