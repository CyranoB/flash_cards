import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getClientIP, isValidIP, validateRequestBody, applyRateLimit, RateLimitResult } from "@/lib/middleware"
import { logApiRequest } from "@/lib/logging"
import { handleAnalyze, handleGenerateBatch, handleGenerateMCQBatch } from "@/lib/ai/controller"
import { ValidationError, ConfigurationError } from '@/lib/errors'

// Increase function duration for AI operations
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Extract and validate client IP from request headers
    const headersList = await headers()
    const ip = getClientIP(headersList)
    
    if (!isValidIP(ip)) {
      console.warn(`Invalid IP detected: ${ip}, falling back to localhost`)
      logApiRequest("invalid_ip", "127.0.0.1", 400, `Invalid IP format detected: ${ip}`)
    }
    
    // Use the validated IP (or fallback) for rate limiting
    const validIP = isValidIP(ip) ? ip : "127.0.0.1"

    // Apply rate limiting
    const rateLimitResult: RateLimitResult = await applyRateLimit(validIP)
    if (!rateLimitResult.success) {
      logApiRequest("rate_limit_exceeded", validIP, rateLimitResult.status || 429, rateLimitResult.error || "Rate limit exceeded");
      return NextResponse.json(
        { error: rateLimitResult.error || "Too many requests. Please try again later." },
        { 
          status: rateLimitResult.status || 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // Read and validate request body
    const body = await request.json()
    try {
      validateRequestBody(body)
    } catch (error) {
      if (error instanceof ValidationError) {
        logApiRequest(body?.type || "unknown", validIP, 400, error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    // Route to appropriate handler based on operation type
    const { type } = body
    
    try {
      switch (type) {
        case "analyze":
          return await handleAnalyze(body, validIP)
        
        case "generate-batch":
          return await handleGenerateBatch(body, validIP)
        
        case "generate-mcq-batch":
          return await handleGenerateMCQBatch(body, validIP)
        
        default:
          throw new ValidationError("Invalid operation type")
      }
    } catch (error) {
      if (error instanceof ConfigurationError) {
        logApiRequest("config_error", validIP, 500, error.message);
        return NextResponse.json(
          { error: "Server configuration error. Please check your environment variables or .env file." },
          { status: 500 }
        );
      }
      
      // Generic error handling
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      logApiRequest(type, validIP, 500, errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    const headersList = await headers()
    const ip = getClientIP(headersList)
    const validIP = isValidIP(ip) ? ip : "127.0.0.1"
    
    // Generic error handling for unexpected errors
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    logApiRequest("unknown", validIP, 500, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
