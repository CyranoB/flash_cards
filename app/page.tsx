"use client"

import { useEffect, useState } from "react"
import { Upload } from "@/components/upload"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

export default function HomePage() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    async function checkApiKey() {
      try {
        const response = await fetch('/api/verify-key')
        const data = await response.json()
        setHasApiKey(data.hasApiKey)
      } catch (error) {
        console.error('Error checking API key:', error)
        setHasApiKey(false)
      }
    }

    checkApiKey()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageToggle />
        <ThemeToggle />
      </header>
      <main className="flex-1">
        {hasApiKey === false && (
          <div className="max-w-md mx-auto mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t.apiKeyMissing}</AlertTitle>
              <AlertDescription>
                {t.apiKeyMissingDesc}
              </AlertDescription>
            </Alert>
          </div>
        )}
        <Upload />
      </main>
    </div>
  )
}

