import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SessionProvider } from "@/contexts/session-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "minimaLLM - AI-Powered Study & Research Assistant",
  description:
    "Your intelligent and modular assistant designed to support students, researchers, and creators in learning, researching, and building projects.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
