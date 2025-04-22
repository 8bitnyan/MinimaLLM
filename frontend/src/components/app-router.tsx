"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import LoginPage from "../app/login/page"
import Dashboard from "../app/dashboard/page"
import AccountPage from "../app/account/page"
import SettingsPage from "../app/settings/page"
import React from "react"
import { useSession } from "@/contexts/session-context"

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
  const { sessions, activeSessionId, setActiveSessionId } = useSession()
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | "account" | "settings" | null>(null)
  const [currentPath, setCurrentPath] = useState("/")
  
  // Simple navigation function
  const navigate = (path: string) => {
    // Prevent navigation to the same page
    if (path === currentPath) {
      console.log(`Already on ${path}, skipping navigation`)
      return
    }
    
    console.log(`Navigating to: ${path}`);
    
    // Default to dashboard for root path
    if (path === "/" && isAuthenticated) {
      path = "/dashboard"
    }
    
    setCurrentPath(path)
    // Update browser URL without reload
    window.history.pushState({}, "", path)
    
    // Set the current view based on the path
    if (path === "/login") {
      setCurrentView("login")
    } else if (path === "/account") {
      setCurrentView("account")
    } else if (path === "/settings") {
      setCurrentView("settings")
    } else {
      // Default to dashboard for any other path if authenticated
      setCurrentView("dashboard")
    }

    // Ensure active session is maintained when navigating to settings or account
    if ((path === "/account" || path === "/settings") && sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
    }
  }

  useEffect(() => {
    console.log(`Auth state changed - authenticated: ${isAuthenticated}, loading: ${loading}, offline: ${isOffline}`);
    
    if (!loading) {
      // Get the current path from the browser
      const path = window.location.pathname
      
      if (isAuthenticated) {
        // Check if we're on a specific page first
        if (path === "/account") {
          console.log('User is authenticated, setting view to account');
          setCurrentView("account")
          setCurrentPath("/account")
          
          // Ensure active session is maintained on account page
          if (sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id)
          }
        } else if (path === "/settings") {
          console.log('User is authenticated, setting view to settings');
          setCurrentView("settings")
          setCurrentPath("/settings")
          
          // Ensure active session is maintained on settings page
          if (sessions.length > 0 && !activeSessionId) {
            setActiveSessionId(sessions[0].id)
          }
        } else {
          // Default to dashboard for root path or any other path
          console.log('User is authenticated, setting view to dashboard');
          setCurrentView("dashboard")
          setCurrentPath("/dashboard")
          
          // Update URL if we're at the root
          if (path === "/") {
            window.history.pushState({}, "", "/dashboard")
          }
        }
      } else {
        console.log('User is not authenticated, setting view to login');
        setCurrentView("login")
        setCurrentPath("/login")
      }
    }
  }, [isAuthenticated, loading, isOffline, sessions, activeSessionId, setActiveSessionId])
  
  // Add an effect to handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      console.log(`Popstate detected, path: ${path}`)
      
      if (!isAuthenticated) {
        setCurrentView("login")
        setCurrentPath("/login")
        return
      }
      
      // Update the current view based on the path
      if (path === "/login") {
        setCurrentView("login")
        setCurrentPath("/login")
      } else if (path === "/account") {
        setCurrentView("account")
        setCurrentPath("/account")
        
        // Ensure active session is maintained on account page
        if (sessions.length > 0 && !activeSessionId) {
          setActiveSessionId(sessions[0].id)
        }
      } else if (path === "/settings") {
        setCurrentView("settings")
        setCurrentPath("/settings")
        
        // Ensure active session is maintained on settings page
        if (sessions.length > 0 && !activeSessionId) {
          setActiveSessionId(sessions[0].id)
        }
      } else {
        // Default to dashboard for root path or any other path
        setCurrentView("dashboard")
        setCurrentPath("/dashboard")
      }
    }
    
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isAuthenticated, sessions, activeSessionId, setActiveSessionId])
  
  // Memoize the router context value to prevent unnecessary re-renders
  const routerContextValue = React.useMemo(() => ({
    navigate,
    currentPath
  }), [navigate, currentPath]);
  
  if (loading || currentView === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Use a switch-like pattern to ensure only one view is rendered
  let ActiveView = null
  switch (currentView) {
    case "dashboard":
      ActiveView = <Dashboard key="dashboard" />
      break
    case "login":
      ActiveView = <LoginPage key="login" />
      break
    case "account":
      ActiveView = <AccountPage key="account" />
      break
    case "settings":
      ActiveView = <SettingsPage key="settings" />
      break
    default:
      // Fallback to dashboard if authenticated, otherwise login
      ActiveView = isAuthenticated ? <Dashboard key="dashboard" /> : <LoginPage key="login" />
  }
  
  return (
    <RouterContext.Provider value={routerContextValue}>
      {ActiveView}
    </RouterContext.Provider>
  )
} 