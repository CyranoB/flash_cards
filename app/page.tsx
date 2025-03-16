import { Suspense } from "react"
import { Upload } from "@/components/upload"
import { LanguageToggle } from "@/components/language-toggle"
import { ConfigButton } from "@/components/config-button"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex">
        <h1 className="text-2xl font-bold">AI Flashcard Generator</h1>
        <div className="flex items-center space-x-2">
          <ConfigButton />
          <LanguageToggle />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <Upload />
        </Suspense>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-3xl text-center text-sm opacity-50">
        <p>Upload your course transcript (max 50,000 words) to generate flashcards</p>
        <p className="mt-2">
          <Link href="/config" passHref>
            <Button variant="link" size="sm">
              Configure OpenAI API settings
            </Button>
          </Link>
        </p>
      </div>
      <Toaster />
    </main>
  )
}

