# Supabase Setup Guide for minimaLLM

This guide provides instructions for setting up the Supabase backend required for the minimaLLM application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create an account if you don't have one.
2. Create a new project.
3. Note your project URL and anon key (under Settings > API).

## 2. Configure Environment Variables

Create a `.env` file in the `frontend` directory with the following content:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Create Required Database Tables

Execute the following SQL in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own chat sessions
CREATE POLICY "Users can view their own chat sessions" 
  ON chat_sessions FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own chat sessions
CREATE POLICY "Users can create their own chat sessions" 
  ON chat_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own chat sessions
CREATE POLICY "Users can update their own chat sessions" 
  ON chat_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own chat sessions
CREATE POLICY "Users can delete their own chat sessions" 
  ON chat_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Set up Row Level Security (RLS) for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view messages in their chat sessions
CREATE POLICY "Users can view messages in their chat sessions" 
  ON messages FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM chat_sessions 
      WHERE id = chat_session_id
    )
  );

-- Create policy to allow users to insert messages in their chat sessions
CREATE POLICY "Users can insert messages in their chat sessions" 
  ON messages FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM chat_sessions 
      WHERE id = chat_session_id
    )
  );
```

## 4. Enable Real-time for Tables

1. Go to your Supabase project dashboard.
2. Navigate to Database > Replication.
3. In the "Realtime" section, add both tables (`chat_sessions` and `messages`) to enable real-time updates.

## 5. Configure Authentication

1. Go to Authentication > Settings.
2. Make sure Email Auth is enabled.
3. Configure your site URL (for redirects after confirmation).
4. If you want to allow users to sign up without email confirmation, disable "Email Confirmation" in the Email Auth settings.

## 6. Testing

After completing setup, you should be able to:
1. Register and log in to the application
2. Create chat sessions
3. Send and receive messages
4. See real-time updates when messages are added 