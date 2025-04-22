"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAppRouter } from "@/components/app-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionSidebar } from "@/components/session-sidebar"
import { SessionHeader } from "@/components/session-header"
import { useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AccountPage() {
  const { user, isAuthenticated, loading, isOffline } = useAuth()
  const { navigate } = useAppRouter()
  const { open } = useSidebar()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<{type: "success" | "error", text: string} | null>(null)
  const mountedRef = useRef(true);
  
  // Use a ref to track whether we should redirect based on session selection
  // This ensures we don't redirect just because a session exists
  const sessionJustSelected = useRef(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }
    
    // Set initial values
    if (user) {
      setDisplayName(user.user_metadata?.name || "")
      setEmail(user.email || "")
    }

    // Cleanup function to ensure proper unmounting
    return () => {
      // Only log if the component is actually unmounting from the DOM
      if (mountedRef.current) {
        console.log("Account page unmounted")
        mountedRef.current = false;
      }
    }
  }, [isAuthenticated, loading, navigate, user])

  // Only redirect if a session was actively selected via the sidebar
  // and not just because there's an active session
  useEffect(() => {
    return () => {
      // Reset the flag when unmounting
      sessionJustSelected.current = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isOffline) return
    
    setIsUpdating(true)
    setUpdateMessage(null)
    
    try {
      // This is where you would call your actual update profile method
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful update
      setUpdateMessage({
        type: "success",
        text: "Your profile has been updated successfully."
      })
    } catch {
      setUpdateMessage({
        type: "error",
        text: "Failed to update profile. Please try again."
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Don't render anything while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Don't render if not authenticated
  if (!isAuthenticated) return null

  const isDemoUser = user?.email === 'demo@example.com'

  return (
    <div
      className="grid h-screen overflow-hidden bg-background text-foreground"
      style={{
        gridTemplateColumns: open ? "auto 1fr" : "auto 1fr",
        gridTemplateRows: "auto 1fr",
      }}
    >
      {/* Sidebar - should take exactly the width specified in the sidebar component */}
      <div className="col-span-1 row-span-2 z-sidebar w-auto">
        <SessionSidebar onSessionSelected={() => {
          sessionJustSelected.current = true;
          navigate("/dashboard");
        }} />
      </div>

      {/* Header */}
      <div className="col-start-2 row-start-1 z-header">
        <SessionHeader />
      </div>

      {/* Main Content */}
      <div className="col-start-2 row-start-2 overflow-hidden z-content">
        <main className="h-full overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Your Account</h2>
              <p className="text-muted-foreground">
                Manage your personal information and settings
              </p>
            </div>

            {isDemoUser && (
              <Alert className="mb-6" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Account</AlertTitle>
                <AlertDescription>
                  You are using a demo account. Profile changes will not be saved between sessions.
                </AlertDescription>
              </Alert>
            )}

            {updateMessage && (
              <Alert 
                className="mb-6" 
                variant={updateMessage.type === "success" ? "default" : "destructive"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{updateMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {updateMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              <Card>
                <CardContent className="p-6 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {displayName ? displayName.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-medium">{displayName || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <p className="mt-2 text-sm">
                    Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          disabled={isUpdating || isDemoUser}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled={true}
                          placeholder="Your email"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isUpdating || isDemoUser || isOffline}
                        className="w-full md:w-auto"
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 