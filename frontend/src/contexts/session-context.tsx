"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Types for our sessions
export interface StudySession {
  id: string
  name: string
  lastModified: Date
  type: "notes" | "flashcards" | "research" | "summary"
  content?: any // This would store the actual session data
}

interface SessionContextType {
  sessions: StudySession[]
  activeSessionId: string | null
  activeSession: StudySession | null
  setActiveSessionId: (id: string | null) => void
  createSession: (name: string, type: StudySession["type"]) => void
  updateSession: (id: string, data: Partial<StudySession>) => void
  deleteSession: (id: string) => void
  saveSessionContent: (id: string, content: any) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: "1",
      name: "Biology Midterm",
      lastModified: new Date(2023, 3, 15),
      type: "notes",
      content: "Initial notes for biology midterm...",
    },
    {
      id: "2",
      name: "History Research Paper",
      lastModified: new Date(2023, 3, 10),
      type: "research",
      content: {
        topic: "French Revolution",
        outline: ["Introduction", "Causes", "Events", "Aftermath", "Conclusion"],
      },
    },
    {
      id: "3",
      name: "Physics Formulas",
      lastModified: new Date(2023, 3, 5),
      type: "flashcards",
      content: [
        { question: "What is Newton's First Law?", answer: "An object at rest stays at rest..." },
        { question: "What is F=ma?", answer: "Force equals mass times acceleration" },
      ],
    },
  ])

  const [activeSessionId, setActiveSessionId] = useState<string | null>("1")

  // Get the active session object
  const activeSession = activeSessionId ? sessions.find((s) => s.id === activeSessionId) || null : null

  // Create a new session
  const createSession = (name: string, type: StudySession["type"]) => {
    const newSession: StudySession = {
      id: Date.now().toString(),
      name,
      lastModified: new Date(),
      type,
      content: type === "flashcards" ? [] : "",
    }

    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
  }

  // Update a session
  const updateSession = (id: string, data: Partial<StudySession>) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === id ? { ...session, ...data, lastModified: new Date() } : session)),
    )
  }

  // Delete a session
  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(sessions.length > 0 ? sessions[0].id : null)
    }
  }

  // Save content for a session
  const saveSessionContent = (id: string, content: any) => {
    updateSession(id, { content })
  }

  // Load sessions from localStorage on initial load
  useEffect(() => {
    const savedSessions = localStorage.getItem("minimaLLM-sessions")
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        // Convert string dates back to Date objects
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          lastModified: new Date(session.lastModified),
        }))
        setSessions(sessionsWithDates)
      } catch (e) {
        console.error("Error loading sessions from localStorage", e)
      }
    }
  }, [])

  // Save sessions to localStorage when they change
  useEffect(() => {
    localStorage.setItem("minimaLLM-sessions", JSON.stringify(sessions))
  }, [sessions])

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        activeSession,
        setActiveSessionId,
        createSession,
        updateSession,
        deleteSession,
        saveSessionContent,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
