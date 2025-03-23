import { NextResponse } from "next/server"
import { analyzeTranscript, generateFlashcards, generateMCQs } from "./service"
import { logApiRequest } from "@/lib/logging"

// Controller functions for each operation type
export async function handleAnalyze(body: any, ip: string) {
  try {
    const { transcript, language = "en" } = body
    const result = await analyzeTranscript({ transcript, language })
    logApiRequest("analyze", ip, 200)
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred"
    logApiRequest("analyze", ip, 500, errorMessage)
    throw error
  }
}

export async function handleGenerateBatch(body: any, ip: string) {
  try {
    const { courseData, transcript, count = 10, language = "en" } = body
    const result = await generateFlashcards({ courseData, transcript, count, language })
    logApiRequest("generate-batch", ip, 200)
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred"
    logApiRequest("generate-batch", ip, 500, errorMessage)
    throw error
  }
}

export async function handleGenerateMCQBatch(body: any, ip: string) {
  try {
    const { courseData, transcript, count = 10, language = "en" } = body
    const result = await generateMCQs({ courseData, transcript, count, language })
    logApiRequest("generate-mcq-batch", ip, 200)
    return NextResponse.json(result)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred"
    logApiRequest("generate-mcq-batch", ip, 500, errorMessage)
    throw error
  }
}
