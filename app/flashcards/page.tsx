"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { generateFlashcards } from "@/lib/ai"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthHeader } from "@/components/auth-header"

interface Flashcard {
  question: string
  answer: string
  id: string
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [batchStartIndex, setBatchStartIndex] = useState(0)
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
    
    try {
      const courseData = JSON.parse(sessionStorage.getItem("courseData") || "{}")
      const transcript = sessionStorage.getItem("transcript") || ""
      const batchSize = 10 // Number of flashcards to generate at once

      // Use the content language for generating flashcards
      const newFlashcards = await generateFlashcards(courseData, transcript, batchSize, contentLanguage, flashcards)

      // Use functional updates to ensure we're working with the latest state
      setFlashcards(prev => [...prev, ...newFlashcards])
      return true
    } catch (error) {
      toast({
        title: t.errorTitle,
        description: t.flashcardError,
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [contentLanguage, t, toast])

  // Function to move to the next flashcard
  const goToNextFlashcard = useCallback(async () => {
    setShowAnswer(false)

    // If we're at the 10th card in this batch, go to summary
    if (currentIndex === batchStartIndex + 10) {
      // Store current flashcards and the count of completed cards (10, 20, etc.)
      sessionStorage.setItem("flashcards", JSON.stringify(flashcards))
      sessionStorage.setItem("lastCompletedIndex", (currentIndex + 1).toString())
      router.push("/summary")
      return
    }
    
    // Only advance if we have cards available for this batch
    if (currentIndex < flashcards.length) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, flashcards.length, generateMoreFlashcards, isLoading, batchStartIndex, router])

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

  // Initialize flashcards - handles both new sessions and continuing sessions
  useEffect(() => {
    const initializeFlashcards = async () => {
      if (isInitialized && !isLoading) {
        const isContinuingSession = sessionStorage.getItem('startNextFlashcardBatch')
        
        if (isContinuingSession) {
          // Load existing flashcards from storage
          const storedFlashcards = sessionStorage.getItem("flashcards")
          if (storedFlashcards) {
            const loadedCards = JSON.parse(storedFlashcards)
            
            // Set states synchronously before generating more
            setFlashcards(loadedCards)
            const newBatchStart = Math.floor(loadedCards.length / 10) * 10
            setBatchStartIndex(newBatchStart)
            setCurrentIndex(newBatchStart + 1) // Set index to the start of the new batch
            setIsLoading(true) // Set loading to true *before* generating
            
            // Generate next batch using loaded cards directly
            try {
              const courseData = JSON.parse(sessionStorage.getItem("courseData") || "{}")
              const transcript = sessionStorage.getItem("transcript") || ""
              const batchSize = 10
              
              const newFlashcards = await generateFlashcards(
                courseData,
                transcript,
                batchSize,
                contentLanguage,
                loadedCards // Pass loaded cards directly instead of using state
              )
              
              // Update state with combined cards
              setFlashcards(prev => [...prev, ...newFlashcards])
            } catch (error) {
              toast({
                title: t.errorTitle,
                description: t.flashcardError,
                variant: "destructive",
              })
            }
          }
          sessionStorage.removeItem('startNextFlashcardBatch')
        } else if (flashcards.length === 0) {
          // New session - generate first batch
          await generateMoreFlashcards()
          setCurrentIndex(1)
          setBatchStartIndex(0)
        }
      }
    }
    initializeFlashcards()
  }, [isInitialized, isLoading, contentLanguage, t])

  const handleStop = () => {
    // Store the flashcards for the summary
    // Store the next card's index to be consistent with automatic redirection
    sessionStorage.setItem("flashcards", JSON.stringify(flashcards))
    sessionStorage.setItem("lastCompletedIndex", (currentIndex + 1).toString())
    router.push("/summary")
  }

  const currentFlashcard = currentIndex > 0 && currentIndex <= flashcards.length 
    ? flashcards[currentIndex - 1] 
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-3xl font-bold text-center">{t.flashcardsTitle}</h1>

          {isLoading ? (
            <Card className="w-full min-h-[16rem]">
              <CardHeader>
                <Skeleton className="h-8 w-2/3 mx-auto" />
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[8rem] px-6 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <p className="text-sm text-muted-foreground mt-4">
                  {t.generating}
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Skeleton className="h-10 w-24" />
              </CardFooter>
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
            {currentIndex === batchStartIndex + 10 ? (
              <div className="w-full flex justify-center">
                <Button onClick={handleStop}>
                  {t.finishButton}
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={handleStop}>
                  {t.stopButton}
                </Button>
                <Button onClick={goToNextFlashcard} disabled={isLoading}>
                  {isLoading ? t.generating : t.nextButton}
                </Button>
              </>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t.cardCount}: {currentIndex > 0 ? currentIndex - batchStartIndex : 0}
          </p>
        </div>
      </div>
    </div>
  )
}
