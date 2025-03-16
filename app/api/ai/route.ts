import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getOpenAIConfig } from "@/lib/env"

// Increase function duration for AI operations
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Read the request body once
    const body = await request.json()
    const { type, language } = body
    
    try {
      const { apiKey, model, baseURL } = getOpenAIConfig()
      
      const openai = createOpenAI({
        apiKey,
        baseURL,
      })

      if (type === "analyze") {
        const { transcript } = body
        const languageInstructions = language === "en" ? "Respond in English." : "Répondez en français."
        const prompt = `
          You are an educational assistant helping university students study.
          Analyze the following course transcript and:
          1. Determine the main subject of the course
          2. Create a concise outline with 3-5 key points
          
          Transcript:
          ${transcript}
          
          ${languageInstructions}
          
          IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
          The JSON must have this exact structure:
          {"subject": "The main subject of the course", "outline": ["Key point 1", "Key point 2", "Key point 3"]}
        `

        const { text } = await generateText({
          model: openai(model),
          prompt,
          temperature: 0.7,
          maxTokens: 500,
        })

        try {
          const result = JSON.parse(text.trim());
          return NextResponse.json(result);
        } catch (parseError) {
          throw new Error("Failed to parse AI response");
        }
      } else if (type === "generate") {
        const { courseData } = body
        const languageInstructions = language === "en" ? "Create the flashcard in English." : "Créez la fiche en français."
        const prompt = `
          You are an educational assistant helping university students study.
          Based on the following course information, create a single flashcard with a question and answer.
          Make the question challenging but clear, and the answer concise but comprehensive.
          
          Course Subject: ${courseData.subject}
          Course Outline: ${courseData.outline.join(", ")}
          
          ${languageInstructions}
          
          IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
          The JSON must have this exact structure:
          {"question": "The question for the flashcard", "answer": "The answer for the flashcard"}
        `

        const { text } = await generateText({
          model: openai(model),
          prompt,
          temperature: 0.8,
          maxTokens: 300,
        })

        try {
          const result = JSON.parse(text.trim());
          return NextResponse.json(result);
        } catch (parseError) {
          throw new Error("Failed to parse AI response");
        }
      }

      throw new Error("Invalid operation type")
    } catch (configError) {
      console.error("OpenAI Configuration Error:", configError);
      return NextResponse.json(
        { error: "API key configuration error. Please check your environment variables or .env file." },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    )
  }
} 