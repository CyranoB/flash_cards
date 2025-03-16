import { NextResponse } from "next/server"
import { getEnvVariable } from "@/lib/env"

export async function GET() {
  try {
    const apiKey = getEnvVariable('OPENAI_API_KEY');
    const model = getEnvVariable('OPENAI_MODEL', 'gpt-4o-mini');
    const baseURL = getEnvVariable('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    
    // Log environment variable status (without exposing values)
    console.log("API Key Verification:", {
      hasApiKey: !!apiKey,
      model,
      baseURL,
      source: apiKey ? 'Found API key' : 'No API key found'
    })

    return NextResponse.json({ 
      hasApiKey: !!apiKey,
      model
    })
  } catch (error) {
    console.error("Error verifying API key:", error)
    return NextResponse.json({ hasApiKey: false }, { status: 500 })
  }
} 