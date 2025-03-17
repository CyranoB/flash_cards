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
        const { courseData, transcript } = body
        const languageInstructions = language === "en" ? "Create the flashcard in English." : "Créez la fiche en français."
        const prompt = `
          You are an educational assistant helping university students study.
          Based on the following course information and transcript, create a single flashcard with a question and answer.
          
          Course Subject: ${courseData.subject}
          Course Outline: ${courseData.outline.join(", ")}
          
          Original Transcript:
          ${transcript}
          
          IMPORTANT INSTRUCTIONS:
          1. Use the actual content from the transcript to create questions, not just the subject and outline
          2. Vary the question types between:
             - Definitions (What is...?)
             - Comparisons (How does X compare to Y?)
             - Applications (How would you use...?)
             - Analysis (Why does...?)
             - Cause and Effect (What happens when...?)
             - Examples (Give an example of...)
          
          2. Use different question formats:
             - Open-ended questions
             - Fill-in-the-blank statements
             - True/False with explanation
             - "Identify the concept" questions
          
          3. Vary the cognitive depth:
             - Basic recall (remembering facts)
             - Understanding (explaining concepts)
             - Application (using knowledge in new situations)
             - Analysis (breaking down complex ideas)
          
          4. Make questions:
             - Based on specific details from the transcript
             - Challenging but clear
             - Focused on key concepts
             - Engaging and thought-provoking
             - Different from previous questions in the session
          
          ${languageInstructions}
          
          IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
          The JSON must have this exact structure:
          {"question": "The question for the flashcard", "answer": "The answer for the flashcard"}
        `

        const { text } = await generateText({
          model: openai(model),
          prompt,
          temperature: 0.9,
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