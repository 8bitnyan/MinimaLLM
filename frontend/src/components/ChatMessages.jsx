import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

export default function ChatMessages({ chatSessionId, userId }) {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState('openai');
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages and set up real-time subscription
  useEffect(() => {
    if (!chatSessionId) return;
    
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        
        // Fetch messages for this chat session
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_session_id', chatSessionId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for messages
    const subscription = supabase
      .channel(`messages-${chatSessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_session_id=eq.${chatSessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
            
            // Update chat session title if this is the first user message
            if (payload.new.role === 'user' && messages.length === 0) {
              updateChatTitle(payload.new.content);
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(message => 
                message.id === payload.new.id ? payload.new : message
              )
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [chatSessionId, messages.length]);

  // Update chat title based on first message
  const updateChatTitle = async (content) => {
    // Create a title from the first few words (max 5 words or 30 chars)
    let title = content.split(' ').slice(0, 5).join(' ');
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
    
    try {
      await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', chatSessionId);
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  // Send a message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !chatSessionId) return;

    setLoading(true);
    setError(null);
    
    try {
      // Store the user message in Supabase
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert([
          {
            chat_session_id: chatSessionId,
            user_id: userId,
            role: 'user',
            content: prompt,
            created_at: new Date().toISOString()
          }
        ]);
        
      if (userMessageError) throw userMessageError;
      
      // Clear the prompt
      setPrompt('');
      
      // Call the API to generate a response
      const res = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          provider
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      // Store the AI response in Supabase
      await supabase
        .from('messages')
        .insert([
          {
            chat_session_id: chatSessionId,
            user_id: userId,
            role: 'assistant',
            content: data.response,
            provider: data.provider,
            created_at: new Date().toISOString()
          }
        ]);
        
      // Update the chat session's updated_at time
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatSessionId);
        
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle provider switch
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
  };

  if (!chatSessionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <p>Select a chat from the sidebar or start a new chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleProviderChange('openai')}
            className={`px-4 py-2 rounded-md ${
              provider === 'openai' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            OpenAI
          </button>
          <button
            onClick={() => handleProviderChange('gemini')}
            className={`px-4 py-2 rounded-md ${
              provider === 'gemini' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            Gemini
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                {message.role === 'user' ? (
                  <div className="bg-blue-100 p-3 rounded-lg mb-2 ml-8">
                    <p className="font-semibold text-blue-800">You</p>
                    <p className="text-gray-800">{message.content}</p>
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg mr-8 ${
                    message.provider === 'openai' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    <p className={`font-semibold ${
                      message.provider === 'openai' ? 'text-blue-800' : 'text-green-800'
                    }`}>
                      {message.provider === 'openai' ? 'OpenAI' : 'Gemini'}
                    </p>
                    <p className="text-gray-800">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex flex-col space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || !prompt.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : provider === 'openai'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
} 