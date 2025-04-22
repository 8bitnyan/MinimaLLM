import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AppRouter } from "@/components/app-router"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SessionProvider>
          <SidebarProvider defaultOpen={true}>
            <AppRouter />
          </SidebarProvider>
        </SessionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
