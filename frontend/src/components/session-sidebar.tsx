"use client"

import { useState } from "react"
import { BookOpen, FolderPlus, Home, MoreHorizontal, Plus, Search, Settings, Trash2, User2 } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/contexts/session-context"
import { useAppRouter } from "@/components/app-router"

interface SessionSidebarProps {
  onSessionSelected?: () => void;
}

export function SessionSidebar({ onSessionSelected }: SessionSidebarProps) {
  const { sessions, activeSessionId, setActiveSessionId, createSession, deleteSession } = useSession()
  const { open } = useSidebar()
  const { navigate, currentPath } = useAppRouter()

  const [newSessionName, setNewSessionName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  // Check if dashboard is active
  const isDashboardActive = currentPath === "/dashboard" || currentPath === "/"
  
  // Check if account or settings are active
  const isAccountActive = currentPath === "/account"
  const isSettingsActive = currentPath === "/settings"

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => 
    session && session.title && session.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create a new session
  const handleCreateSession = () => {
    if (!newSessionName.trim()) return

    createSession(newSessionName)
    setNewSessionName("")
    setIsCreateDialogOpen(false)
  }

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
    
    // Call the onSessionSelected callback if provided
    if (onSessionSelected) {
      onSessionSelected();
    }
    // Navigate to dashboard if on settings or account page
    else if (currentPath === "/settings" || currentPath === "/account") {
      navigate("/dashboard");
    }
  };

  // Get icon for session type
  const getSessionIcon = (type?: string) => {
    switch (type) {
      case "notes":
        return <BookOpen className="h-4 w-4" />
      case "flashcards":
        return <BookOpen className="h-4 w-4" />
      case "research":
        return <Search className="h-4 w-4" />
      case "summary":
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <aside
      className={cn(
        "h-screen flex flex-col border-r border-border bg-background transition-all duration-300 ease-in-out z-sidebar overflow-hidden",
        open ? "w-64" : "w-16",
      )}
    >
      {/* Sidebar Header */}
      <div className="border-b border-border p-4 flex-shrink-0">
        <div className={cn("flex items-center", open ? "justify-between" : "justify-center")}>
          {open && <h2 className="text-lg font-semibold">minimaLLM</h2>}
        </div>
        {open && (
          <div className="mt-2">
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-grow overflow-y-auto p-2">
        {/* Home/Dashboard */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size={open ? "default" : "icon"}
            className={cn(
              "w-full justify-start hover:bg-muted", 
              !open && "justify-center px-0",
              isDashboardActive && "bg-secondary text-secondary-foreground"
            )}
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4" />
            {open && <span className="ml-2">Dashboard</span>}
          </Button>
        </div>

        <div className="my-2 h-px bg-border" />

        {/* Study Sessions */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {open && <h3 className="text-sm font-medium text-foreground">Study Sessions</h3>}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 text-primary hover:text-primary-foreground hover:bg-primary",
                    !open && "mx-auto",
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New Session</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card text-card-foreground">
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Create a new study session to organize your work.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Session Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter session name..."
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="bg-muted text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateSession}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ul className="space-y-1">
            {filteredSessions.map((session) => (
              <li key={session.id}>
                <div className="relative flex items-center">
                  <Button
                    variant="ghost"
                    size={open ? "default" : "icon"}
                    className={cn(
                      "w-full justify-start",
                      !open && "justify-center px-0",
                      activeSessionId === session.id ? "bg-secondary text-secondary-foreground" : "hover:bg-muted",
                    )}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    {getSessionIcon()}
                    {open && <span className="ml-2">{session.title}</span>}
                  </Button>

                  {open && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start" className="w-48 bg-card text-card-foreground">
                        <DropdownMenuItem>
                          <FolderPlus className="mr-2 h-4 w-4" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </li>
            ))}

            {open && filteredSessions.length === 0 && (
              <div className="px-4 py-2 text-sm text-muted-foreground">No sessions found</div>
            )}
          </ul>
        </div>

        <div className="my-4 h-px bg-border" />

        {/* Quick Access */}
        <div>
          {open && <h3 className="mb-2 text-sm font-medium text-foreground">Quick Access</h3>}
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                size={open ? "default" : "icon"}
                className={cn("w-full justify-start hover:bg-muted", !open && "justify-center px-0")}
              >
                <BookOpen className="h-4 w-4" />
                {open && <span className="ml-2">All Notes</span>}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size={open ? "default" : "icon"}
                className={cn("w-full justify-start hover:bg-muted", !open && "justify-center px-0")}
              >
                <Search className="h-4 w-4" />
                {open && <span className="ml-2">Recent Searches</span>}
              </Button>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t border-border p-2 flex-shrink-0">
        <ul className="space-y-1">
          <li>
            <Button
              variant="ghost"
              size={open ? "default" : "icon"}
              className={cn(
                "w-full justify-start hover:bg-muted sidebar-footer-btn", 
                !open && "justify-center px-0",
                isAccountActive && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => navigate("/account")}
            >
              <User2 className="h-4 w-4" />
              {open && <span className="ml-2">Account</span>}
            </Button>
          </li>
          <li>
            <Button
              variant="ghost"
              size={open ? "default" : "icon"}
              className={cn(
                "w-full justify-start hover:bg-muted sidebar-footer-btn", 
                !open && "justify-center px-0",
                isSettingsActive && "bg-secondary text-secondary-foreground"
              )}
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4" />
              {open && <span className="ml-2">Settings</span>}
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
