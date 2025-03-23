"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { analyzeTranscript } from "@/lib/ai"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    const transcript = sessionStorage.getItem("transcript")

    if (!transcript) {
      toast({
        title: t.errorTitle,
        description: t.noTranscript,
        variant: "destructive",
      })
      router.push("/")
      return
    }

    const processTranscript = async () => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return prev
            }
            return prev + 10
          })
        }, 500)

        setStatus(t.analyzing)

        // Process the transcript with AI, passing the current language
        const result = await analyzeTranscript(transcript, language)

        // Store the results and the language used
        sessionStorage.setItem("courseData", JSON.stringify(result))
        sessionStorage.setItem("contentLanguage", language)

        // Complete the progress
        clearInterval(progressInterval)
        setProgress(100)
        setStatus(t.complete)

        // Navigate to results page
        setTimeout(() => {
          router.push("/results")
        }, 1000)
      } catch (error) {
        console.error("Processing error:", error)
        toast({
          title: t.errorTitle,
          description: error instanceof Error ? error.message : t.aiError,
          variant: "destructive",
        })
        router.push("/")
      }
    }

    processTranscript()
  }, [router, toast, t, language])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-bold text-center">{t.processingTitle}</h1>
        <Progress value={progress} className="w-full" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
