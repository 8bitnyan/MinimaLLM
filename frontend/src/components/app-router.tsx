"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import LoginPage from "../app/login/page"
import Dashboard from "../app/dashboard/page"
import React from "react"

// Create a simple router context to be used across the app
export const RouterContext = React.createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  navigate: (_path: string) => {}, // use _ to indicate intentionally unused parameter
  currentPath: "/"
})

export function useAppRouter() {
  return React.useContext(RouterContext)
}

export function AppRouter() {
  const { isAuthenticated, loading, isOffline } = useAuth()
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | null>(null)
  const [currentPath, setCurrentPath] = useState("/")
  
  // Simple navigation function
  const navigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    setCurrentPath(path)
    // Update browser URL without reload
    window.history.pushState({}, "", path)
  }

  useEffect(() => {
    console.log(`Auth state changed - authenticated: ${isAuthenticated}, loading: ${loading}, offline: ${isOffline}`);
    
    if (!loading) {
      if (isAuthenticated) {
        console.log('User is authenticated, setting view to dashboard');
        setCurrentView("dashboard")
        setCurrentPath("/dashboard")
      } else {
        console.log('User is not authenticated, setting view to login');
        setCurrentView("login")
        setCurrentPath("/login")
      }
    }
  }, [isAuthenticated, loading, isOffline])
  
  if (loading || currentView === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <RouterContext.Provider value={{ navigate, currentPath }}>
      {currentView === "dashboard" ? <Dashboard /> : <LoginPage />}
    </RouterContext.Provider>
  )
} 