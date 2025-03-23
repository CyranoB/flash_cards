import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getOpenAIConfig, getRateLimitConfig } from "@/lib/env"
import { rateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"
import { RateLimitError, ValidationError, ConfigurationError } from '@/lib/errors'

// Increase function duration for AI operations
export const maxDuration = 60;

// Initialize rate limiter with configurable values
const { interval, maxTrackedIPs, requestsPerMinute } = getRateLimitConfig();
const limiter = rateLimit({
  interval,
  maxTrackedIPs
})

/**
 * Extract client IP from request headers
 * Checks x-forwarded-for and x-real-ip headers
 */
function getClientIP(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  } else if (realIP) {
    return realIP.trim()
  }
  
  return "127.0.0.1" // fallback to localhost if no IP found
}

/**
 * Validate IP address format (IPv4 or IPv6)
 */
function isValidIP(ip: string): boolean {
  // Remove any surrounding brackets from IPv6 addresses
  ip = ip.replace(/^\[|\]$/g, '');

  // IPv4 validation
  if (ip.includes('.')) {
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
      return false;
    }
    
    // Validate each octet is between 0 and 255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  // IPv6 validation
  if (ip.includes(':')) {
    // Check for compressed notation (::)
    const hasCompressedZeros = ip.includes('::');
    if (hasCompressedZeros && (ip.match(/::/g) || []).length > 1) {
      return false; // Only one '::' allowed
    }
    
    // Split into segments
    const segments = ip.split(':');
    
    // Count actual segments (accounting for ::)
    const actualSegments = hasCompressedZeros 
      ? segments.filter(s => s !== '').length
      : segments.length;
    
    // Check if we have the right number of segments
    if (!hasCompressedZeros && actualSegments !== 8) {
      return false;
    }
    if (hasCompressedZeros && actualSegments > 7) {
      return false;
    }
    
    // Validate each segment
    return segments.every(segment => {
      if (segment === '') return true; // Allow empty segments for ::
      return /^[0-9A-Fa-f]{1,4}$/.test(segment);
    });
  }
  
  return false; // Neither IPv4 nor IPv6
}

// Validate request body
function validateRequestBody(body: any) {
  if (!body) {
    throw new ValidationError("Missing request body")
  }
  
  if (!body.type || !["analyze", "generate-batch", "generate-mcq-batch"].includes(body.type)) {
    throw new ValidationError("Invalid operation type")
  }

  if (body.type === "analyze" && !body.transcript) {
    throw new ValidationError("Missing transcript for analysis")
  }

  if (body.type === "generate-batch") {
    if (!body.courseData) throw new ValidationError("Missing course data")
    if (!body.transcript) throw new ValidationError("Missing transcript")
    if (body.count && (isNaN(body.count) || body.count < 1 || body.count > 50)) {
      throw new ValidationError("Invalid count (must be between 1 and 50)")
    }
  }

  // Check content length
  const contentLength = JSON.stringify(body).length
  if (contentLength > 100000) { // 100KB limit
    throw new ValidationError("Request body too large")
  }
}

// Log API requests
function logApiRequest(type: string, ip: string, status: number, error?: string) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      type,
      ip,
      status,
      error: error || null,
    })
  )
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

    // Apply rate limiting with configurable requests per minute
    try {
      await limiter.check(requestsPerMinute, validIP)
    } catch (error) {
      if (error instanceof RateLimitError) {
        // Calculate retry-after time and rate limit headers
        const retryAfterSeconds = Math.ceil(interval / 1000);
        const resetTime = Date.now() + interval;

        logApiRequest("rate_limit_exceeded", validIP, 429, error.message);
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfterSeconds.toString(),
              'X-RateLimit-Limit': requestsPerMinute.toString(),
              'X-RateLimit-Reset': resetTime.toString()
            }
          }
        );
      }
      // Re-throw unexpected errors
      throw error;
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

    const { type, language = "en" } = body
    
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
          temperature: 0.5,
          maxTokens: 2048,
        })

        try {
          const result = JSON.parse(text.trim());
          logApiRequest(type, validIP, 200)
          return NextResponse.json(result);
        } catch (parseError) {
          console.error("Parse Error Details:");
          console.error("Request:", {
            type,
            language,
            model,
            baseURL,
            // Omit sensitive data like apiKey
          });
          console.error("Raw AI Response:", text);
          console.error("Parse Error:", parseError);
          logApiRequest(type, validIP, 500, "Failed to parse AI response")
          throw new Error("Failed to parse AI response");
        }
      } else if (type === "generate-batch") {
        const { courseData, transcript, count = 10 } = body
        const languageInstructions = language === "en" ? "Create the flashcards in English." : "Créez les fiches en français."
        const prompt = `
          You are an educational assistant helping university students study.
          Based on the following course information and transcript, create ${count} flashcards with questions and answers.
          
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
             - Multiple choice questions
             
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
             - Different from each other
          
          ${languageInstructions}
          
          IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
          The JSON must have this exact structure:
          {"flashcards": [
            {"question": "Question 1", "answer": "Answer 1"},
            {"question": "Question 2", "answer": "Answer 2"},
            ... and so on for all ${count} flashcards
          ]}
        `

        const { text } = await generateText({
          model: openai(model),
          prompt,
          temperature: 0.9,
          maxTokens: 8192,
        })

        try {
          const result = JSON.parse(text.trim());
          logApiRequest(type, validIP, 200)
          return NextResponse.json(result);
        } catch (parseError) {
          console.error("Parse Error Details:");
          console.error("Request:", {
            type,
            language,
            model,
            baseURL,
            courseData,
            count,
            // Omit transcript for brevity
          });
          console.error("Raw AI Response:", text);
          console.error("Parse Error:", parseError);
          logApiRequest(type, validIP, 500, "Failed to parse AI response")
          throw new Error("Failed to parse AI response");
        }
      } else if (type === "generate-mcq-batch") {
        const { courseData, transcript, count = 10 } = body
        const languageInstructions = language === "en" 
          ? "Create the questions in English." 
          : "Créez les questions en français."
        
        const prompt = `
          You are an educational assistant helping university students study.
          Based on the following course information and transcript, create ${count} multiple choice questions.
          
          Course Subject: ${courseData.subject}
          Course Outline: ${courseData.outline.join(", ")}
          
          Original Transcript:
          ${transcript}
          
          IMPORTANT INSTRUCTIONS:
          1. Each question must have exactly 4 options (A, B, C, D)
          2. Exactly one option must be correct
          3. The other 3 options must be plausible but incorrect
          4. Use actual content from the transcript
          5. Vary question difficulty and cognitive levels
          
          ${languageInstructions}
          
          CRITICAL: Reply ONLY with a valid JSON object. No explanations, no markdown formatting, no code block markers.
          
          Use this simplified JSON format:
          
          {"questions": [
            {
              "question": "What is the primary function of mitochondria in a cell?",
              "A": "Protein synthesis",
              "B": "Energy production",
              "C": "Cell division",
              "D": "Waste elimination",
              "correct": "B"
            },
            {
              "question": "Which programming paradigm treats computation as the evaluation of mathematical functions?",
              "A": "Procedural programming",
              "B": "Object-oriented programming",
              "C": "Functional programming",
              "D": "Event-driven programming",
              "correct": "C"
            }
          ]}
          
          Now create ${count} questions in this exact format based on the transcript provided.
        `

        const { text } = await generateText({
          model: openai(model),
          prompt,
          temperature: 0.7,
          maxTokens: 4096,
        })

        try {
          // Advanced cleaning of the response
          let cleanedResponse = text.trim();
          
          // Remove any markdown code block markers
          if (cleanedResponse.startsWith("```")) {
            // Find the first newline after the opening backticks
            const jsonStartIndex = cleanedResponse.indexOf("\n") + 1;
            
            // Find the last occurrence of closing backticks
            const jsonEndIndex = cleanedResponse.lastIndexOf("```");
            
            if (jsonEndIndex > jsonStartIndex) {
              cleanedResponse = cleanedResponse.substring(jsonStartIndex, jsonEndIndex).trim();
            }
          }
          
          // Remove "json" language marker if present
          if (cleanedResponse.startsWith("json")) {
            cleanedResponse = cleanedResponse.substring(4).trim();
          }
          
          // Final cleanup to ensure valid JSON
          // Replace any trailing commas before closing brackets (common JSON error)
          cleanedResponse = cleanedResponse.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          
          // Try to repair and extract just the questions array if the structure is incomplete
          if (!cleanedResponse.startsWith("{")) {
            const questionsStart = cleanedResponse.indexOf('{"questions":');
            if (questionsStart >= 0) {
              cleanedResponse = cleanedResponse.substring(questionsStart);
            }
          }
          
          console.log("Cleaned response:", cleanedResponse);
          
          const result = JSON.parse(cleanedResponse);
          logApiRequest(type, validIP, 200);
          
          // Validate the structure of the parsed result
          if (!result.questions || !Array.isArray(result.questions)) {
            throw new Error("Invalid response structure: missing questions array");
          }
          
          return NextResponse.json({ questions: result.questions });
        } catch (parseError) {
          console.error("Parse Error Details:");
          console.error("Request:", {
            type,
            language,
            model,
            baseURL,
          });
          console.error("Raw AI Response:", text);
          console.error("Parse Error:", parseError);
          
          // Fallback approach - try to extract and fix the JSON if possible
          try {
            // Look for the questions array pattern and try to extract it
            const match = text.match(/{\s*"questions"\s*:\s*\[.*?\]\s*}/);
            if (match && match[0]) {
              const extractedJson = match[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
              console.log("Attempting to parse extracted JSON:", extractedJson);
              const fallbackResult = JSON.parse(extractedJson);
              logApiRequest(type, validIP, 200);
              return NextResponse.json({ questions: fallbackResult.questions });
            }
          } catch (fallbackError) {
            console.error("Fallback parsing also failed:", fallbackError);
          }
          
          logApiRequest(type, validIP, 500, "Failed to parse AI response");
          throw new Error("Failed to parse AI response");
        }
      }

      throw new Error("Invalid operation type")
    } catch (configError) {
      console.error("OpenAI Configuration Error:", configError);
      throw new ConfigurationError("API key configuration error");
    }
  } catch (error) {
    const headersList = await headers()
    const ip = getClientIP(headersList)
    const validIP = isValidIP(ip) ? ip : "127.0.0.1"
    
    // Handle different error types
    if (error instanceof ConfigurationError) {
      logApiRequest("config_error", validIP, 500, error.message);
      return NextResponse.json(
        { error: "Server configuration error. Please check your environment variables or .env file." },
        { status: 500 }
      );
    }
    
    // Generic error handling
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    logApiRequest("unknown", validIP, 500, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 