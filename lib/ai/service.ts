import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getOpenAIConfig } from "@/lib/env"
import { prompts } from "./prompts"
import { ConfigurationError } from '@/lib/errors'

// Types for AI operations
export type AnalyzeParams = {
  transcript: string
  language: string
}

export type GenerateBatchParams = {
  courseData: { subject: string, outline: string[] }
  transcript: string
  count: number
  language: string
}

export type GenerateMCQBatchParams = {
  courseData: { subject: string, outline: string[] }
  transcript: string
  count: number
  language: string
}

// Clean AI response from markdown formatting
export function cleanAIResponse(text: string): string {
  // Remove markdown code blocks (```json and ```)
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  return cleaned;
}

// Generic function to handle AI requests and response parsing
async function makeAIRequest<T>(prompt: string, temperature = 0.5, maxTokens = 2048): Promise<T> {
  try {
    const { apiKey, model, baseURL } = getOpenAIConfig()
    
    const openai = createOpenAI({
      apiKey,
      baseURL,
    })

    const { text } = await generateText({
      model: openai(model),
      prompt,
      temperature,
      maxTokens,
    })

    try {
      const cleanedText = cleanAIResponse(text.trim());
      return JSON.parse(cleanedText) as T;
    } catch (parseError) {
      console.error("Parse Error Details:");
      console.error("Raw AI Response:", text);
      console.error("Parse Error:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (configError) {
    console.error("OpenAI Configuration Error:", configError);
    throw new ConfigurationError("API key configuration error");
  }
}

// Service functions for each operation type
export async function analyzeTranscript(params: AnalyzeParams) {
  const prompt = prompts.analyze(params.transcript, params.language);
  return makeAIRequest<{ subject: string, outline: string[] }>(prompt, 0.5, 2048);
}

export async function generateFlashcards(params: GenerateBatchParams) {
  const prompt = prompts.generateBatch(params.courseData, params.transcript, params.count, params.language);
  return makeAIRequest<{ flashcards: { question: string, answer: string }[] }>(prompt, 0.9, 4096);
}

export async function generateMCQs(params: GenerateMCQBatchParams) {
  const prompt = prompts.generateMCQBatch(params.courseData, params.transcript, params.count, params.language);
  return makeAIRequest<{ questions: any[] }>(prompt, 0.7, 4096);
}
