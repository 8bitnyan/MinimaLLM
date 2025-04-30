"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import supabase from "@/lib/supabase"
import { useAuth } from "./auth-context"

// Types for our sessions
export interface StudySession {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface ChatMessage {
  id: string
  chat_session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  provider?: string | null
  created_at: string
  visualization?: React.ReactNode
}

interface SessionContextType {
  sessions: StudySession[]
  activeSessionId: string | null
  activeSession: StudySession | null
  messages: ChatMessage[]
  loading: boolean
  error: Error | null
  setActiveSessionId: (id: string | null) => void
  createSession: (title: string) => Promise<string | null>
  updateSession: (id: string, data: Partial<Omit<StudySession, 'id' | 'user_id' | 'created_at'>>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  sendMessage: (content: string, provider?: string) => Promise<string | null>
  fetchMessages: (sessionId: string) => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Get the active session object
  const activeSession = activeSessionId ? sessions.find((s) => s.id === activeSessionId) || null : null

  // Fetch sessions when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSessions([])
      setActiveSessionId(null)
      return
    }

    const fetchSessions = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error

        // Ensure data is StudySession[] and has required fields
        if (Array.isArray(data) && data.every(item => item && typeof item.id === 'string')) {
          setSessions(data as unknown as StudySession[])
          // Set first session as active if there's no active session
          if (data.length > 0 && !activeSessionId) {
            const firstId = data[0]?.id
            if (typeof firstId === 'string') {
              setActiveSessionId(firstId)
              await fetchMessages(firstId)
            }
          }
        } else {
          setSessions([])
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()

    // Subscribe to changes in chat_sessions
    const sessionsSubscription = supabase
      .channel('chat_sessions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_sessions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSessions(prev => [payload.new as StudySession, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setSessions(prev => prev.map(session => 
            session.id === payload.new.id ? payload.new as StudySession : session
          ))
        } else if (payload.eventType === 'DELETE') {
          setSessions(prev => prev.filter(session => session.id !== payload.old.id))
          if (activeSessionId === payload.old.id) {
            setActiveSessionId(sessions.length > 0 ? sessions[0].id : null)
          }
        }
      })
      .subscribe()

    return () => {
      sessionsSubscription.unsubscribe()
    }
  }, [isAuthenticated, user])

  // Fetch messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  // Create a new session
  const createSession = async (title: string): Promise<string | null> => {
    if (!user) return null
    
    try {
      setLoading(true)
      const newSession = {
        title,
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(newSession)
        .select()
        .single()

      if (error) throw error

      if (data && typeof data.id === 'string') {
        setActiveSessionId(data.id)
        return data.id
      } else {
        return null
      }
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update a session
  const updateSession = async (id: string, data: Partial<Omit<StudySession, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('chat_sessions')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', typeof user?.id === 'string' ? user.id : '')

      if (error) throw error
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Delete a session
  const deleteSession = async (id: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', typeof user?.id === 'string' ? user.id : '')

      if (error) throw error
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for a session
  const fetchMessages = async (sessionId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Ensure data is ChatMessage[] and has required fields
      if (Array.isArray(data) && data.every(item => item && typeof item.id === 'string')) {
        setMessages(data as unknown as ChatMessage[])
      } else {
        setMessages([])
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  // Send a message in the active session
  const sendMessage = async (content: string, provider?: string): Promise<string | null> => {
    if (!activeSessionId || !user) return null;
    
    try {
      setLoading(true);
      const message = {
        chat_session_id: activeSessionId,
        user_id: user.id,
        role: 'user' as const,
        content,
        provider,
      };
      
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select('id')
        .single();
        
      if (error) throw error;
      
      // Update the session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeSessionId);
      
      // Fetch the updated messages
      await fetchMessages(activeSessionId);
      
      return (data && typeof data.id === 'string') ? data.id : null;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    sessions,
    activeSessionId,
    activeSession,
    messages,
    loading,
    error,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
    sendMessage,
    fetchMessages,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
