import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/hooks/use-language"
import { Toaster } from "@/components/ui/toaster"
import ServerConfigCheck from "@/components/server-config-check"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Flashcard Generator",
  description: "Generate flashcards from your course transcripts using AI"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ServerConfigCheck>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <LanguageProvider>
              {children}
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
        </ServerConfigCheck>
      </body>
    </html>
  )
}



import './globals.css'