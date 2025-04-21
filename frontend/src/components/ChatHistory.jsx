import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ChatHistory({ onSelectChat, userId }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    // Fetch user's chat sessions from Supabase
    const fetchChats = async () => {
      try {
        setLoading(true);
        
        // Get all chat sessions for the user
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        setChats(data || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load your chat history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
    
    // Set up real-time subscription for chat sessions
    const subscription = supabase
      .channel('chat_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Handle different change types
          if (payload.eventType === 'INSERT') {
            setChats(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setChats(prev => 
              prev.map(chat => 
                chat.id === payload.new.id ? payload.new : chat
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setChats(prev => 
              prev.filter(chat => chat.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      // Clean up subscription when component unmounts
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  // Create a new chat session
  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          { 
            user_id: userId,
            title: 'New Chat',
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        onSelectChat(data[0]);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      setError('Failed to create a new chat');
    }
  };

  return (
    <div className="border-r border-gray-200 p-4 w-64 h-full overflow-y-auto">
      <button
        onClick={createNewChat}
        className="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        New Chat
      </button>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : chats.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No chat history found. Start a new chat!
        </div>
      ) : (
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => onSelectChat(chat)}
                className="w-full text-left p-2 rounded-md hover:bg-gray-100 truncate"
              >
                {chat.title || 'Untitled Chat'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 