import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { McqQuestion } from "@/types/mcq"
import { toast } from "@/components/ui/use-toast"
import { config } from "@/lib/config"

// Function to get OpenAI configuration
function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"

  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please check your environment variables.")
  }

  return { apiKey, model, baseURL }
}

/**
 * Extract a representative sample from a large transcript
 * This preserves the beginning, middle, and end of the document
 * to maintain context while reducing the overall size
 * 
 * @param text The full transcript text
 * @param maxLength Maximum length of the sample (default: from config)
 * @returns A representative sample of the text
 */
function extractSampleFromTranscript(text: string, maxLength: number = config.transcriptChunkThreshold): string {
  if (text.length <= maxLength) return text;
  
  // Take portions from beginning, middle and end
  const thirdSize = Math.floor(maxLength / 3);
  const beginning = text.substring(0, thirdSize);
  const middleStart = Math.floor(text.length / 2) - Math.floor(thirdSize / 2);
  const middle = text.substring(middleStart, middleStart + thirdSize);
  const end = text.substring(text.length - thirdSize);
  
  return `${beginning}\n\n[...]\n\n${middle}\n\n[...]\n\n${end}`;
}

/**
 * Handle API response with rate limit awareness and transient error handling
 * 
 * This utility handles:
 * - 429 Too Many Requests (rate limits)
 * - 5xx Server Errors (transient backend issues)
 * 
 * @param response The fetch response
 * @returns Processed response data
 */
async function handleApiResponse(response: Response) {
  if (response.ok) {
    return await response.json();
  }
  
  // Handle retryable status codes (rate limits and server errors)
  const isRateLimit = response.status === 429;
  const isServerError = response.status >= 500 && response.status < 600;
  
  if (isRateLimit || isServerError) {
    try {
      const errorData = await response.json();
      
      // Get retry time from response or use default
      const retryAfter = errorData.retryAfter || 
                         parseInt(response.headers.get('retry-after') || '0') || 
                         (isRateLimit ? 10 : 5); // Default: 10s for rate limits, 5s for server errors
      
      // Show appropriate toast message
      toast({
        title: isRateLimit 
          ? "Processing taking longer than expected" 
          : "Temporary server issue",
        description: isRateLimit
          ? "We're experiencing high demand. Please wait while we retry your request."
          : "We're having trouble connecting to our servers. Retrying automatically.",
        duration: 5000,
      });
      
      // Wait and retry automatically
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Return a special value indicating retry
      return { shouldRetry: true };
    } catch (error) {
      // If we can't parse the error response, still retry
      const retryAfter = isRateLimit ? 10 : 5;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return { shouldRetry: true };
    }
  }
  
  // Handle other errors
  let errorMessage = "Something went wrong";
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorMessage;
  } catch (e) {
    // If we can't parse the error, use status text
    errorMessage = response.statusText || errorMessage;
  }
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  throw new Error(errorMessage);
}

// Create a request cache outside the function to persist between calls
const requestCache = new Map<string, any>();

// Debugging function to see what's being cached
function getDebugCacheInfo() {
  return {
    cacheSize: requestCache.size,
    cacheKeys: Array.from(requestCache.keys())
  };
}

/**
 * Fetch with automatic retry for rate limits and transient errors
 * 
 * Features:
 * - Request deduplication to prevent duplicate API calls
 * - Automatic retry for 429 rate limits
 * - Automatic retry for 5xx server errors
 * - Exponential backoff with 2x multiplier
 * - Maximum delay cap to prevent excessive waits
 * - User feedback via toast notifications
 * 
 * @param url API endpoint
 * @param options Fetch options
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @returns Processed response data
 */
export async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
) {
  // Parse the body to create a more reliable cache key
  let bodyObj = {};
  try {
    if (options.body && typeof options.body === 'string') {
      bodyObj = JSON.parse(options.body);
    }
  } catch (e) {
    console.error("Could not parse request body for cache key:", e);
  }
  
  // Create a more robust cache key including explicit language info
  const language = bodyObj && (bodyObj as any).language ? (bodyObj as any).language : 'unknown';
  const type = bodyObj && (bodyObj as any).type ? (bodyObj as any).type : 'unknown';
  const cacheKey = `${url}-${type}-${language}-${options.body}`;
  
  console.log("Cache key:", cacheKey);
  console.log("Cache info:", getDebugCacheInfo());
  
  // Check if we have a cached response for this exact request
  if (requestCache.has(cacheKey)) {
    console.log("CACHE HIT! Using cached response for", url, "with language", language, "and type", type);
    return requestCache.get(cacheKey);
  } else {
    console.log("CACHE MISS! No cached response for", url, "with language", language, "and type", type);
  }

  let retries = 0;
  const MAX_DELAY = 30000; // Maximum delay of 30 seconds
  const startTime = Date.now();
  const MAX_TOTAL_RETRY_TIME = 120000; // Maximum 2 minutes of total retry time
  
  while (retries <= maxRetries) {
    try {
      // Check if we've been retrying too long
      if (Date.now() - startTime > MAX_TOTAL_RETRY_TIME) {
        toast({
          title: "Request timeout",
          description: "We couldn't complete your request in a reasonable time. Please try again later.",
          variant: "destructive",
        });
        throw new Error("Maximum retry time exceeded");
      }
      
      const response = await fetch(url, options);
      const result = await handleApiResponse(response);
      
      // If we got a retry signal, continue the loop
      if (result && result.shouldRetry) {
        retries++;
        continue;
      }
      
      // Cache the successful response before returning
      console.log("Caching response for key:", cacheKey);
      requestCache.set(cacheKey, result);
      
      // Otherwise return the result
      return result;
    } catch (error: any) {
      retries++;
      
      if (retries > maxRetries) {
        // We've exhausted our retries, show a final error
        toast({
          title: "Request failed",
          description: "We couldn't complete your request after several attempts.",
          variant: "destructive",
        });
        throw error;
      }
      
      // Wait before retrying (exponential backoff with 2x multiplier and cap)
      const delay = Math.min(1000 * Math.pow(2, retries), MAX_DELAY);
      console.log(`Retry ${retries}/${maxRetries} after ${delay/1000}s due to: ${error.message || 'Unknown error'}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen, but TypeScript wants a return statement
  throw new Error("Maximum retries reached");
}

// Function to analyze transcript and generate course subject and outline
export async function analyzeTranscript(transcript: string, language: "en" | "fr" = "en") {
  try {
    // Check if transcript is too large for a single request (using configurable threshold)
    const isLargeTranscript = transcript.length > config.transcriptChunkThreshold;
    
    if (isLargeTranscript) {
      console.log(`Large transcript detected (${transcript.length} chars). Using summarization approach.`);
      
      // Create a representative sample of the transcript
      const sample = extractSampleFromTranscript(transcript);
      
      // Send the sample for analysis
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: sample,
          language,
          type: "analyze",
          isPartialTranscript: true,
        }),
      });
      
      return response;
    } else {
      // For normal-sized transcripts, proceed with the regular approach
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          language,
          type: "analyze",
        }),
      });
      
      return response;
    }
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    throw error;
  }
}

// Function to generate a flashcard based on course data
export async function generateFlashcard(courseData: any, transcript: string, language: "en" | "fr" = "en") {
  try {
    const response = await fetchWithRetry("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "generate",
        courseData,
        transcript,
        language,
      }),
    })
    
    return response
  } catch (error) {
    console.error("Error generating flashcard:", error)
    throw error
  }
}

// Function to generate multiple flashcards based on course data
export async function generateFlashcards(courseData: any, transcript: string, count: number = 10, language: "en" | "fr" = "en") {
  try {
    // Check if transcript is too large for a single request (using configurable threshold)
    const isLargeTranscript = transcript.length > config.transcriptChunkThreshold;
    
    if (isLargeTranscript) {
      console.log(`Large transcript detected (${transcript.length} chars). Using summarization approach for flashcards.`);
      
      // Create a representative sample of the transcript
      const sample = extractSampleFromTranscript(transcript);
      
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseData,
          transcript: sample,
          count,
          language,
          type: "generate-batch",
          isPartialTranscript: true,
        }),
      });
      
      // Extract the flashcards array from the response
      if (response && response.flashcards && Array.isArray(response.flashcards)) {
        return response.flashcards;
      }
      
      // Return empty array if no flashcards found
      console.warn("No flashcards found in response:", response);
      return [];
    } else {
      // For normal-sized transcripts, proceed with the regular approach
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseData,
          transcript,
          count,
          language,
          type: "generate-batch",
        }),
      });
      
      // Extract the flashcards array from the response
      if (response && response.flashcards && Array.isArray(response.flashcards)) {
        return response.flashcards;
      }
      
      // Return empty array if no flashcards found
      console.warn("No flashcards found in response:", response);
      return [];
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
}

export async function generateMcqs(
  courseData: any,
  transcript: string,
  language: "en" | "fr" = "en",
  count: number = 10
): Promise<McqQuestion[]> {
  try {
    // Check if transcript is too large for a single request (using configurable threshold)
    const isLargeTranscript = transcript.length > config.transcriptChunkThreshold;
    
    if (isLargeTranscript) {
      console.log(`Large transcript detected (${transcript.length} chars). Using summarization approach for MCQs.`);
      
      // Create a representative sample of the transcript
      const sample = extractSampleFromTranscript(transcript);
      
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseData,
          transcript: sample,
          count,
          language,
          type: "generate-mcq-batch",
          isPartialTranscript: true,
        }),
      });
      
      // Check if the response has questions property (from API) and convert to mcqs format
      if (response.questions && Array.isArray(response.questions)) {
        return response.questions;
      }
      
      // If mcqs property exists, return it directly
      return response.mcqs || [];
    } else {
      // For normal-sized transcripts, proceed with the regular approach
      const response = await fetchWithRetry("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseData,
          transcript,
          count,
          language,
          type: "generate-mcq-batch",
        }),
      });
      
      // Check if the response has questions property (from API) and convert to mcqs format
      if (response.questions && Array.isArray(response.questions)) {
        return response.questions;
      }
      
      // If mcqs property exists, return it directly
      return response.mcqs || [];
    }
  } catch (error) {
    console.error("Error generating MCQs:", error);
    throw error;
  }
}
