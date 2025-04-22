import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/contexts/session-context";
import { useAuth } from "@/contexts/auth-context";
import { useMessageService } from "@/lib/message-service";

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { activeSessionId, activeSession, messages, createSession } = useSession();
  const messageService = useMessageService();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-center text-muted-foreground">Please log in to start a conversation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-center text-muted-foreground">
              {activeSession
                ? "No messages yet. Send a message to start the conversation."
                : "Create a new session or select one from the sidebar."}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.provider && msg.role === "assistant" && (
                  <p className="text-xs mt-2 opacity-70">Powered by {msg.provider}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || !activeSessionId}
          />
          <Button type="submit" disabled={isLoading || !message.trim() || !activeSessionId}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
} 