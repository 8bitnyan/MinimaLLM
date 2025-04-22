"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect } from "react"
import { useAppRouter } from "@/components/app-router"
import { AlertCircle, WifiOff } from "lucide-react"

export default function LoginPage() {
  const { navigate } = useAppRouter()
  const { signIn, signUp, isAuthenticated, isOffline } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")
    
    try {
      const { error } = await signIn(loginEmail, loginPassword)
      
      if (error) {
        setErrorMessage(error.message || "Error signing in")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage("Passwords don't match")
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await signUp(signupEmail, signupPassword)
      
      if (error) {
        setErrorMessage(error.message || "Error signing up")
      } else {
        alert("Success! Please check your email to verify your account")
        navigate("/dashboard")
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const useDemoAccount = () => {
    setLoginEmail("demo@example.com")
    setLoginPassword("password")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">minimaLLM</CardTitle>
          <CardDescription>Your AI-powered study assistant</CardDescription>
          
          {isOffline && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-md text-sm">
              <WifiOff className="h-4 w-4" />
              <span>Offline Mode - Limited functionality available</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Button variant="link" size="sm" className="px-0 h-auto text-xs">
                      Forgot password?
                    </Button>
                  </div>
                  <Input 
                    id="login-password" 
                    type="password" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                
                {isOffline && (
                  <div className="pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={useDemoAccount}
                    >
                      Use Demo Account
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Demo account allows limited functionality while offline
                    </p>
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={signupPassword} 
                    onChange={(e) => setSignupPassword(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input 
                    id="signup-confirm-password" 
                    type="password" 
                    value={signupConfirmPassword} 
                    onChange={(e) => setSignupConfirmPassword(e.target.value)} 
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isOffline}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
                
                {isOffline && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Sign up is unavailable while offline. Please connect to the internet to create a new account.
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex justify-center">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </CardFooter>
      </Card>
    </div>
  )
} 