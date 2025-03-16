import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Function to get OpenAI configuration
function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"

  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please check your environment variables.")
  }

  return { apiKey, model, baseURL }
}

// Function to analyze transcript and generate course subject and outline
export async function analyzeTranscript(transcript: string, language: "en" | "fr" = "en") {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        language,
        type: "analyze",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to analyze transcript")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error analyzing transcript:", error)
    throw error
  }
}

// Function to generate a flashcard based on course data
export async function generateFlashcard(courseData: any, language: "en" | "fr" = "en") {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseData,
        language,
        type: "generate",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to generate flashcard")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error generating flashcard:", error)
    throw error
  }
}

