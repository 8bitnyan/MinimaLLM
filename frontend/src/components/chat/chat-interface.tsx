import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import { useAuth } from "@/contexts/auth-context";
import { useMessageService } from "@/lib/message-service";
import { ArrowDown, Bot, User } from "lucide-react";

// Export the chat messages area as a separate component
export function ChatMessages() {
  const { user } = useAuth();
  const { activeSession, messages } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Function to check if user has scrolled up from bottom
  const checkScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!atBottom);
    setIsAutoScrollEnabled(atBottom);
  };

  // Scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
    setIsAutoScrollEnabled(true);
  };

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrollEnabled) {
      scrollToBottom();
    } else if (messages.length > 0) {
      setShowScrollButton(true);
    }
  }, [messages, isAutoScrollEnabled]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <p className="text-center text-muted-foreground">Please log in to start a conversation.</p>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0 w-full"
      style={{ scrollBehavior: "smooth" }}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <p className="text-center text-muted-foreground">
            {activeSession
              ? "No messages yet. Send a message to start the conversation."
              : "Create a new session or select one from the sidebar."}
          </p>
        </div>
      ) : (
        <>
          {/* Session title at the top */}
          <div className="text-center mb-8 sticky top-0 bg-background/80 backdrop-blur-sm py-2 -mx-4 px-4 z-10">
            <h2 className="text-lg font-medium text-muted-foreground">{activeSession?.title}</h2>
          </div>
          
          {/* Messages */}
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 group ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/80 border border-border"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.provider && msg.role === "assistant" && (
                    <p className="text-xs mt-3 opacity-70 border-t border-border/40 pt-2">
                      Powered by {msg.provider}
                    </p>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-6 right-6 rounded-full shadow-md"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
}

// Export the chat input form as a separate component
export function ChatInputForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { activeSessionId, createSession } = useSession();
  const messageService = useMessageService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || !user) return;
    
    setIsLoading(true);
    
    try {
      let currentSessionId = activeSessionId;
      
      // Create a new session if there isn't an active one
      if (!currentSessionId) {
        const title = message.length > 30 ? `${message.slice(0, 30)}...` : message;
        currentSessionId = await createSession(title);
        
        if (!currentSessionId) {
          throw new Error("Failed to create a new session");
        }
      }
      
      // Send user message
      await messageService.sendUserMessage({
        content: message,
        sessionId: currentSessionId,
      });
      
      // Clear input
      setMessage("");

      // Get AI response
      await messageService.sendAssistantMessage({
        content: message,
        sessionId: currentSessionId,
        userId: user.id,
        activeTools: [], // Add your active tools here
      });
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background/80 backdrop-blur-sm p-4 w-full">
      <div className="flex space-x-2 max-w-4xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || !activeSessionId}
          className="bg-muted/50 flex-1"
        />
        <Button type="submit" disabled={isLoading || !message.trim() || !activeSessionId}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}

// Main component that combines both parts
export function ChatInterface() {
  return (
    <div className="flex flex-col h-full w-full max-w-full">
      <ChatMessages />
      <ChatInputForm />
    </div>
  );
} 