"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ResultsRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new course-overview page
    router.replace("/course-overview")
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <p>Redirecting to course overview...</p>
    </div>
  )
}
