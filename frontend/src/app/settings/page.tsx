"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useAppRouter } from "@/components/app-router"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionSidebar } from "@/components/session-sidebar"
import { SessionHeader } from "@/components/session-header"
import { useSidebar } from "@/components/ui/sidebar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { user, isAuthenticated, loading, isOffline } = useAuth()
  const { navigate } = useAppRouter()
  const { open } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [saveOnTyping, setSaveOnTyping] = useState(true)
  const [aiModel, setAiModel] = useState("gpt-4.1-nano")
  const [saveMessage, setSaveMessage] = useState<{type: "success" | "error", text: string} | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Add a useRef to track actual component unmounting
  const mountedRef = useRef(true);
  
  // Use a ref to track whether we should redirect based on session selection
  const sessionJustSelected = useRef(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }
    
    // Cleanup function to ensure proper unmounting
    return () => {
      // Only log if the component is actually unmounting from the DOM
      if (mountedRef.current) {
        console.log("Settings page unmounted")
        mountedRef.current = false;
      }
    }
  }, [isAuthenticated, loading, navigate])

  // Only redirect if a session was actively selected via the sidebar
  useEffect(() => {
    return () => {
      // Reset the flag when unmounting
      sessionJustSelected.current = false;
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isOffline) return
    
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      // This is where you would call your actual update settings method
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate successful update
      setSaveMessage({
        type: "success",
        text: "Your settings have been saved successfully."
      })
    } catch {
      setSaveMessage({
        type: "error",
        text: "Failed to save settings. Please try again."
      })
    } finally {
      setIsSaving(false)
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
              <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
              <p className="text-muted-foreground">
                Customize your application preferences
              </p>
            </div>

            {isDemoUser && (
              <Alert className="mb-6" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Account</AlertTitle>
                <AlertDescription>
                  You are using a demo account. Settings changes will not be saved between sessions.
                </AlertDescription>
              </Alert>
            )}

            {saveMessage && (
              <Alert 
                className="mb-6" 
                variant={saveMessage.type === "success" ? "default" : "destructive"}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{saveMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {saveMessage.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSaveSettings}>
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how the application looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="flex flex-wrap gap-4">
                        <Button
                          type="button"
                          variant={theme === "light" ? "default" : "outline"}
                          onClick={() => setTheme("light")}
                          disabled={isSaving || isDemoUser}
                        >
                          Light
                        </Button>
                        <Button
                          type="button"
                          variant={theme === "dark" ? "default" : "outline"}
                          onClick={() => setTheme("dark")}
                          disabled={isSaving || isDemoUser}
                        >
                          Dark
                        </Button>
                        <Button
                          type="button"
                          variant={theme === "system" ? "default" : "outline"}
                          onClick={() => setTheme("system")}
                          disabled={isSaving || isDemoUser}
                        >
                          System
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Model Settings</CardTitle>
                    <CardDescription>
                      Adjust AI model preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default AI Model</Label>
                      <RadioGroup
                        value={aiModel}
                        onValueChange={setAiModel}
                        disabled={isSaving || isDemoUser}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gpt-4" id="gpt-4" />
                          <Label htmlFor="gpt-4">GPT-4 (Most capable, slower)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gpt-3.5-turbo" id="gpt-3.5-turbo" />
                          <Label htmlFor="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, less capable)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Behavior</CardTitle>
                    <CardDescription>
                      Configure how the application behaves
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications about new responses</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={enableNotifications}
                        onCheckedChange={setEnableNotifications}
                        disabled={isSaving || isDemoUser}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoSave">Auto-save</Label>
                        <p className="text-sm text-muted-foreground">Save sessions automatically while typing</p>
                      </div>
                      <Switch
                        id="autoSave"
                        checked={saveOnTyping}
                        onCheckedChange={setSaveOnTyping}
                        disabled={isSaving || isDemoUser}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  disabled={isSaving || isDemoUser || isOffline}
                  className="w-full md:w-auto"
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
} 