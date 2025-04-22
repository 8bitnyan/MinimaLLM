import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-context"
import Page from "./app/page"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <SidebarProvider defaultOpen={true}>
          <Page />
        </SidebarProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default App
