"use client"

import { Upload } from "@/components/upload"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-end gap-2 p-4">
        <LanguageToggle />
        <ThemeToggle />
      </header>
      <main className="flex-1">
        <Upload />
      </main>
    </div>
  )
}

