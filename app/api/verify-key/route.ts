import { NextResponse } from "next/server"
import { getEnvVariable } from "@/lib/env"

export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  return NextResponse.json({ hasApiKey });
} 