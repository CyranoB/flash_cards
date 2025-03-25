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

// Request deduplication cache - stores recent request results to prevent duplicate processing
// This cache persists across requests but will be reset when the server restarts
// Keys are hash of request body, values are response data with timestamp
interface CacheEntry {
  timestamp: number;
  response: any;
}

const requestCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60000; // Cache entries expire after 1 minute

// Clean expired cache entries periodically
function cleanExpiredCache() {
  const now = Date.now();
  let expiredCount = 0;
  
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      requestCache.delete(key);
      expiredCount++;
    }
  }
  
  if (expiredCount > 0) {
    console.log(`Cleaned ${expiredCount} expired cache entries. Current cache size: ${requestCache.size}`);
  }
}

// Clean cache every minute
setInterval(cleanExpiredCache, 60000);

// Generate a cache key from request body
function generateCacheKey(body: any): string {
  // Create a stable representation of the request body
  const stableBody = JSON.stringify({
    type: body.type,
    language: body.language,
    transcript: body.transcript,
    count: body.count
  });
  
  // Simple hash function for string
  let hash = 0;
  for (let i = 0; i < stableBody.length; i++) {
    const char = stableBody.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${body.type}-${body.language}-${hash}`;
}

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
    
    // Check if we have this exact request in our cache
    const cacheKey = generateCacheKey(body);
    const cachedEntry = requestCache.get(cacheKey);
    
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
      console.log(`Cache HIT for ${body.type} request in ${body.language}. Returning cached response.`);
      logApiRequest(`${body.type}_cached`, validIP, 200, "Served from cache");
      return NextResponse.json(cachedEntry.response);
    } else {
      console.log(`Cache MISS for ${body.type} request in ${body.language}. Processing...`);
    }

    // Route to appropriate handler based on operation type
    const { type } = body
    
    try {
      let response;
      
      switch (type) {
        case "analyze":
          response = await handleAnalyze(body, validIP);
          break;
        
        case "generate-batch":
          response = await handleGenerateBatch(body, validIP);
          break;
        
        case "generate-mcq-batch":
          response = await handleGenerateMCQBatch(body, validIP);
          break;
        
        default:
          throw new ValidationError("Invalid operation type");
      }
      
      // Extract the response data from the NextResponse
      const responseData = await response.json();
      
      // Store in cache before returning
      requestCache.set(cacheKey, {
        timestamp: Date.now(),
        response: responseData
      });
      
      console.log(`Cached response for ${body.type} request in ${body.language}. Cache size: ${requestCache.size}`);
      
      // Return the original response
      return NextResponse.json(responseData);
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
