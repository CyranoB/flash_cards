import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
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
  // Check if Clerk environment variables are available
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled = !!clerkPublishableKey;

  // Wrap content with ClerkProvider only if Clerk is enabled
  const content = (
    <ServerConfigCheck>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </ServerConfigCheck>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {clerkEnabled ? (
          <ClerkProvider
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
                footerActionLink: 'text-primary hover:text-primary/90',
                card: 'bg-background border border-border shadow-sm'
              }
            }}
          >
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  )
}