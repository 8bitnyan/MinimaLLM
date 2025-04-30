import api from './api';
import supabase from './supabase';
import { useSession } from '@/contexts/session-context';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';

interface SendMessageParams {
  content: string;
  sessionId: string;
  userId: string;
  activeTools?: string[];
  visualization?: React.ReactNode;
}

interface SendUserMessageParams {
  content: string;
  sessionId: string;
  visualization?: React.ReactNode;
}

export const useMessageService = () => {
  const { sendMessage, fetchMessages } = useSession();
  const { user } = useAuth();

  const sendUserMessage = async ({ content, visualization }: Omit<SendUserMessageParams, 'sessionId'>) => {
    if (!user) return null;

    try {
      // Send message to Supabase
      const messageId = await sendMessage(content);
      
      // Handle visualization if available
      if (visualization && messageId) {
        // In a real implementation, you would need to store this visualization somewhere
        // For example, in a client-side cache or state tied to message IDs
        // Here we're using a custom event to communicate this to message components
        const event = new CustomEvent('message-visualization', {
          detail: { messageId, visualization }
        });
        document.dispatchEvent(event);
      }
      
      return messageId;
    } catch (error) {
      console.error('Error sending user message:', error);
      return null;
    }
  };

  const sendAssistantMessage = async ({ 
    content, 
    sessionId, 
    userId,
    activeTools = [],
    visualization
  }: SendMessageParams) => {
    try {
      // First, send the API request to the backend
      const { response, provider } = await api.generate({
        prompt: content,
        study_mode: true,
        active_tools: activeTools,
      });

      // Then save the assistant message to Supabase
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_session_id: sessionId,
          user_id: userId,
          role: 'assistant',
          content: response,
          provider,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      // Handle visualization if available
      if (visualization && data.id) {
        const event = new CustomEvent('message-visualization', {
          detail: { messageId: data.id, visualization }
        });
        document.dispatchEvent(event);
      }
      
      // Refresh messages
      await fetchMessages(sessionId);
      
      return response;
    } catch (error) {
      console.error('Error sending assistant message:', error);
      
      // Save error message to database
      await supabase
        .from('messages')
        .insert({
          chat_session_id: sessionId,
          user_id: userId,
          role: 'assistant',
          content: 'Sorry, there was an error generating a response. Please try again.',
          provider: 'error',
        });
      
      await fetchMessages(sessionId);
      return null;
    }
  };

  return {
    sendUserMessage,
    sendAssistantMessage,
  };
};

export default useMessageService;