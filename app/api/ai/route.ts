import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getClientIP, isValidIP, validateRequestBody, applyRateLimit, RateLimitResult } from "@/lib/middleware"
import { logApiRequest } from "@/lib/logging"
import { handleAnalyze, handleGenerateBatch, handleGenerateMCQBatch } from "@/lib/ai/controller"
import { ValidationError, ConfigurationError } from '@/lib/errors'

// Increase function duration for AI operations
export const maxDuration = 60;

// Rate limit handling utilities
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // Maximum delay of 30 seconds
const RETRY_STATUS_CODES = [429, 500, 502, 503, 504]; // Rate limit and server errors

/**
 * Fetches from OpenAI API with exponential backoff for rate limits and transient errors
 * 
 * This utility handles:
 * - 429 Too Many Requests (rate limits)
 * - 5xx Server Errors (transient backend issues)
 * 
 * It implements exponential backoff with jitter to prevent thundering herd problems,
 * and caps the maximum delay to prevent excessive wait times.
 * 
 * @param url API endpoint
 * @param options Fetch options
 * @returns Response object
 */
async function fetchWithBackoff(
  url: string, 
  options: RequestInit
): Promise<Response> {
  let retries = 0;
  const startTime = Date.now();
  const timeout = maxDuration * 1000; // Convert maxDuration to milliseconds
  
  while (retries < MAX_RETRIES) {
    try {
      // Check if we're approaching the function timeout
      if (Date.now() - startTime > timeout * 0.8) {
        throw new Error("Approaching function timeout limit");
      }
      
      const response = await fetch(url, options);
      
      // If not a retryable status code, return the response as is
      if (!RETRY_STATUS_CODES.includes(response.status)) {
        return response;
      }
      
      // Get retry information
      const retryAfter = response.headers.get('retry-after');
      let delay = 0;
      
      if (retryAfter && !isNaN(Number(retryAfter))) {
        // Use the retry-after header if available
        delay = Number(retryAfter) * 1000;
      } else {
        // Otherwise use exponential backoff with jitter
        delay = Math.min(
          BASE_DELAY * Math.pow(2, retries) * (0.5 + Math.random() * 0.5),
          MAX_DELAY
        );
      }
      
      retries++;
      console.log(`API returned ${response.status}. Retry ${retries}/${MAX_RETRIES} after ${Math.round(delay/1000)}s`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error: any) {
      if (retries >= MAX_RETRIES) throw error;
      
      retries++;
      const delay = Math.min(
        BASE_DELAY * Math.pow(2, retries) * (0.5 + Math.random() * 0.5),
        MAX_DELAY
      );
      
      console.error(`Fetch error: ${error.message || 'Unknown error'}. Retry ${retries}/${MAX_RETRIES} after ${Math.round(delay/1000)}s`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Maximum retries reached for API request");
}

/**
 * Call OpenAI API with retry logic for rate limits and transient errors
 * @param endpoint OpenAI API endpoint
 * @param payload Request payload
 * @returns API response data
 */
async function callOpenAI(endpoint: string, payload: any) {
  try {
    const response = await fetchWithBackoff(`https://api.openai.com/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`OpenAI API error (${response.status}):`, errorData);
      return { error: errorData.error?.message || `Error calling OpenAI API: ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return { error: error.message || "Unknown error calling OpenAI API" };
  }
}

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
      
      // Return a special status for rate limiting that the client can handle by showing a toast
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.", 
          retryAfter: rateLimitResult.retryAfter || 10 
        },
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
