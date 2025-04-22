export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_session_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          provider: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_session_id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          provider?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_session_id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          provider?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 