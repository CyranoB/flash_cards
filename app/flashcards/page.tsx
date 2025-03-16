"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { generateFlashcard } from "@/lib/ai"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

interface Flashcard {
  question: string
  answer: string
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]
  const [contentLanguage, setContentLanguage] = useState<"en" | "fr">("en")
  const [isInitialized, setIsInitialized] = useState(false)

  // Check for course data and set content language
  useEffect(() => {
    const courseData = sessionStorage.getItem("courseData")
    const storedContentLanguage = sessionStorage.getItem("contentLanguage") as "en" | "fr"

    if (!courseData) {
      toast({
        title: t.errorTitle,
        description: t.noResults,
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Set the content language (the language used for generating content)
    if (storedContentLanguage) {
      setContentLanguage(storedContentLanguage)
    } else {
      // If no stored content language, use the current UI language
      setContentLanguage(language)
      sessionStorage.setItem("contentLanguage", language)
    }

    setIsInitialized(true)
  }, []) // Only run once on mount

  // Generate first flashcard after initialization
  useEffect(() => {
    if (isInitialized && flashcards.length === 0) {
      generateNextFlashcard()
    }
  }, [isInitialized])

  const generateNextFlashcard = async () => {
    setIsLoading(true)
    setShowAnswer(false)

    try {
      const courseData = JSON.parse(sessionStorage.getItem("courseData") || "{}")

      // Use the content language for generating flashcards
      const newFlashcard = await generateFlashcard(courseData, contentLanguage)

      setFlashcards((prev) => [...prev, newFlashcard])
      setCurrentIndex((prev) => prev + 1)
    } catch (error) {
      toast({
        title: t.errorTitle,
        description: t.flashcardError,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = () => {
    // Store the flashcards for the summary
    sessionStorage.setItem("flashcards", JSON.stringify(flashcards))
    router.push("/summary")
  }

  const currentFlashcard = flashcards[currentIndex - 1]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-center">{t.flashcardsTitle}</h1>

        {currentFlashcard ? (
          <Card className="w-full min-h-[16rem]">
            <CardHeader>
              <CardTitle className="text-center">{showAnswer ? t.answerLabel : t.questionLabel}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[8rem] px-6">
              <p className="text-lg text-center">{showAnswer ? currentFlashcard.answer : currentFlashcard.question}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? t.showQuestion : t.showAnswer}</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="w-full min-h-[16rem] flex items-center justify-center">
            <p>{t.loading}</p>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleStop}>
            {t.stopButton}
          </Button>
          <Button onClick={generateNextFlashcard} disabled={isLoading}>
            {isLoading ? t.generating : t.nextButton}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t.cardCount}: {currentIndex}
        </p>
      </div>
    </div>
  )
}

