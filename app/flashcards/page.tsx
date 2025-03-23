"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { generateFlashcards } from "@/lib/ai"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

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
  
  // Memoize the generateMoreFlashcards function to prevent recreation on each render
  const generateMoreFlashcards = useCallback(async () => {
    setIsLoading(true)
    // Remove the progress state updates since we're using indeterminate progress
    
    try {
      const courseData = JSON.parse(sessionStorage.getItem("courseData") || "{}")
      const transcript = sessionStorage.getItem("transcript") || ""
      const batchSize = 10 // Number of flashcards to generate at once

      // Use the content language for generating flashcards
      const newFlashcards = await generateFlashcards(courseData, transcript, batchSize, contentLanguage)

      // Use functional updates to ensure we're working with the latest state
      setFlashcards(prev => [...prev, ...newFlashcards])
      
      if (currentIndex === 0) {
        setCurrentIndex(1) // Start at the first card if we don't have any yet
      }
    } catch (error) {
      toast({
        title: t.errorTitle,
        description: t.flashcardError,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [contentLanguage, t, toast, currentIndex])

  // Function to move to the next flashcard
  const goToNextFlashcard = useCallback(() => {
    setShowAnswer(false)
    
    // Check if we need to generate more flashcards
    if (currentIndex >= flashcards.length) {
      generateMoreFlashcards()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, flashcards.length, generateMoreFlashcards])

  // Check for course data and set content language - only once on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeFlashcards = async () => {
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
      if (storedContentLanguage && mounted) {
        setContentLanguage(storedContentLanguage)
      } else if (mounted) {
        // If no stored content language, use the current UI language
        setContentLanguage(language)
        sessionStorage.setItem("contentLanguage", language)
      }

      if (mounted) {
        setIsInitialized(true)
      }
    }
    
    initializeFlashcards();
    
    return () => {
      mounted = false;
    };
  }, []) // Empty dependency array - only run on mount

  // Generate first batch of flashcards after initialization
  useEffect(() => {
    if (isInitialized && flashcards.length === 0 && !isLoading) {
      generateMoreFlashcards()
    }
  }, [isInitialized, generateMoreFlashcards, isLoading, flashcards.length])

  const handleStop = () => {
    // Store the flashcards for the summary
    sessionStorage.setItem("flashcards", JSON.stringify(flashcards))
    router.push("/summary")
  }

  const currentFlashcard = currentIndex > 0 && currentIndex <= flashcards.length 
    ? flashcards[currentIndex - 1] 
    : null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-center">{t.flashcardsTitle}</h1>

        {isLoading ? (
          <Card className="w-full min-h-[16rem]">
            <CardHeader>
              <CardTitle className="text-center">{t.generating}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[8rem] px-6 space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <Progress className="w-full" indeterminate /> 
              <p className="text-sm text-muted-foreground">
                {t.generating}
              </p>
            </CardContent>
          </Card>
        ) : currentFlashcard ? (
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
          <Button onClick={goToNextFlashcard} disabled={isLoading}>
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
