import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Auth from './Auth';
import ChatHistory from './ChatHistory';
import ChatMessages from './ChatMessages';

export default function Layout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">minimaLLM</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {session.user.email}
          </span>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ChatHistory 
          onSelectChat={handleSelectChat} 
          userId={session.user.id} 
        />
        
        {/* Chat Area */}
        <ChatMessages 
          chatSessionId={currentChat?.id} 
          userId={session.user.id} 
        />
      </div>
    </div>
  );
} 