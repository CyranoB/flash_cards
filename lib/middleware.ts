import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { rateLimit } from "@/lib/rate-limit"
import { getRateLimitConfig } from "@/lib/env"
import { RateLimitError, ValidationError } from '@/lib/errors'

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
export function getClientIP(headersList: Headers): string {
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
export function isValidIP(ip: string): boolean {
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

// Validate request body for AI operations
export function validateRequestBody(body: any) {
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

  if (body.type === "generate-mcq-batch") {
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

// Apply rate limiting middleware
export type RateLimitResult = {
  success: boolean;
  status?: number;
  headers?: {
    'Retry-After': string;
    'X-RateLimit-Limit': string;
    'X-RateLimit-Reset': string;
  };
  error?: string;
}

export async function applyRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    await limiter.check(requestsPerMinute, ip)
    return { success: true }
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Calculate retry-after time and rate limit headers
      const retryAfterSeconds = Math.ceil(interval / 1000);
      const resetTime = Date.now() + interval;

      return { 
        success: false, 
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
          'X-RateLimit-Limit': requestsPerMinute.toString(),
          'X-RateLimit-Reset': resetTime.toString()
        },
        error: "Too many requests. Please try again later."
      }
    }
    // Re-throw unexpected errors
    throw error;
  }
}
