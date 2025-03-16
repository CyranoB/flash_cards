"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

interface CourseData {
  subject: string
  outline: string[]
}

export default function ResultsPage() {
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    const data = sessionStorage.getItem("courseData")

    if (!data) {
      toast({
        title: t.errorTitle,
        description: t.noResults,
        variant: "destructive",
      })
      router.push("/")
      return
    }

    setCourseData(JSON.parse(data))
  }, [router, toast, t])

  const handleReady = () => {
    router.push("/flashcards")
  }

  if (!courseData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>{t.loading}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold text-center">{t.resultsTitle}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t.subjectTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{courseData.subject}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.outlineTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {courseData.outline.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleReady}>
            {t.readyButton}
          </Button>
        </div>
      </div>
    </div>
  )
}

