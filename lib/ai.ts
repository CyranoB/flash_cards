import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Function to get OpenAI configuration
function getOpenAIConfig() {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const apiKey = localStorage.getItem("openai_api_key")
    const model = localStorage.getItem("openai_model") || "gpt-4o-mini"
    const baseURL = localStorage.getItem("openai_base_url") || "https://api.openai.com/v1"

    if (!apiKey) {
      throw new Error("OpenAI API key is missing. Please configure it in the settings.")
    }

    return { apiKey, model, baseURL }
  }

  // Default values for server-side rendering (these won't be used in practice)
  return {
    apiKey: "not-available-during-ssr",
    model: "gpt-4o-mini",
    baseURL: "https://api.openai.com/v1",
  }
}

// Function to analyze transcript and generate course subject and outline
export async function analyzeTranscript(transcript: string, language: "en" | "fr" = "en") {
  try {
    const { apiKey, model, baseURL } = getOpenAIConfig()

    const openai = createOpenAI({
      apiKey,
      baseURL,
    })

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

    // Clean the response to ensure it's valid JSON
    let cleanedText = text.trim()

    // Remove any backticks or markdown code block indicators
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7)
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3)
    }

    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3)
    }

    cleanedText = cleanedText.trim()

    try {
      return JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.log("Raw response:", text)
      console.log("Cleaned response:", cleanedText)

      // Fallback: Create a basic structure if parsing fails
      if (language === "en") {
        return {
          subject: "Unable to determine subject from transcript",
          outline: [
            "Please try again with a clearer transcript",
            "The AI had trouble processing your content",
            "Consider breaking down your transcript into smaller sections",
          ],
        }
      } else {
        return {
          subject: "Impossible de déterminer le sujet à partir de la transcription",
          outline: [
            "Veuillez réessayer avec une transcription plus claire",
            "L'IA a eu du mal à traiter votre contenu",
            "Envisagez de décomposer votre transcription en sections plus petites",
          ],
        }
      }
    }
  } catch (error) {
    console.error("Error analyzing transcript:", error)
    throw error // Propagate the error with its original message
  }
}

// Function to generate a flashcard based on course data
export async function generateFlashcard(courseData: any, language: "en" | "fr" = "en") {
  try {
    const { apiKey, model, baseURL } = getOpenAIConfig()

    const openai = createOpenAI({
      apiKey,
      baseURL,
    })

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

    // Clean the response to ensure it's valid JSON
    let cleanedText = text.trim()

    // Remove any backticks or markdown code block indicators
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.substring(7)
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.substring(3)
    }

    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3)
    }

    cleanedText = cleanedText.trim()

    try {
      return JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.log("Raw response:", text)
      console.log("Cleaned response:", cleanedText)

      // Fallback: Create a basic flashcard if parsing fails
      if (language === "en") {
        return {
          question: "What is the main subject of this course?",
          answer: courseData.subject || "Subject information unavailable",
        }
      } else {
        return {
          question: "Quel est le sujet principal de ce cours?",
          answer: courseData.subject || "Informations sur le sujet non disponibles",
        }
      }
    }
  } catch (error) {
    console.error("Error generating flashcard:", error)
    throw error // Propagate the error with its original message
  }
}

