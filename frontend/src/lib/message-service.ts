import api from './api';
import supabase from './supabase';
import { useSession } from '@/contexts/session-context';
import { useAuth } from '@/contexts/auth-context';

interface SendMessageParams {
  content: string;
  sessionId: string;
  userId: string;
  activeTools?: string[];
}

export const useMessageService = () => {
  const { sendMessage, fetchMessages } = useSession();
  const { user } = useAuth();

  const sendUserMessage = async ({ content, sessionId }: { content: string; sessionId: string }) => {
    if (!user) return null;

    try {
      // Send message to Supabase
      return await sendMessage(content);
    } catch (error) {
      console.error('Error sending user message:', error);
      return null;
    }
  };

  const sendAssistantMessage = async ({ 
    content, 
    sessionId, 
    userId,
    activeTools = [] 
  }: SendMessageParams) => {
    try {
      // First, send the API request to the backend
      const { response, provider } = await api.generate({
        prompt: content,
        study_mode: true,
        active_tools: activeTools,
      });

      // Then save the assistant message to Supabase
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_session_id: sessionId,
          user_id: userId,
          role: 'assistant',
          content: response,
          provider,
        });

      if (error) throw error;
      
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