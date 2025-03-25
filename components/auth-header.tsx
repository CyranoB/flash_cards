"use client"

import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { useEffect, useState } from "react"

export function AuthHeader() {
  const { language } = useLanguage()
  const t = translations[language]
  const [isClerkEnabled, setIsClerkEnabled] = useState(false)

  useEffect(() => {
    // Check if Clerk is enabled by checking for the environment variable
    setIsClerkEnabled(!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  }, [])

  return (
    <header className="flex items-center justify-end gap-2 p-4">
      {isClerkEnabled ? (
        <>
          <SignedIn>
            {/* This component only renders if the user is signed in */}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            {/* This component only renders if the user is signed out */}
            <SignInButton mode="modal">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                {language === "en" ? "Sign In" : "Connexion"}
              </button>
            </SignInButton>
          </SignedOut>
        </>
      ) : null}
      <LanguageToggle />
      <ThemeToggle />
    </header>
  )
}
