import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    // Log environment variable status (without exposing values)
    console.log("API Key Verification:", {
      hasApiKey: !!apiKey,
    })

    return NextResponse.json({ 
      hasApiKey: !!apiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini"
    })
  } catch (error) {
    console.error("Error verifying API key:", error)
    return NextResponse.json({ hasApiKey: false }, { status: 500 })
  }
} 