/**
 * Logging utilities for the application
 */

// Log API requests with standardized format
export function logApiRequest(type: string, ip: string, status: number, error?: string) {
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
