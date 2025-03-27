/**
 * Application configuration
 * 
 * This module provides centralized access to all configuration values
 * from environment variables with appropriate defaults.
 */

// File and transcript size limits
export const config = {
  // File size limits - Use NEXT_PUBLIC_ prefix for client-side access
  maxFileSizeMB: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '25', 10), // Default to 25MB
  maxFileSizeBytes: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '25', 10) * 1024 * 1024, // Default to 25MB
  
  // Word count limits
  maxWordCount: parseInt(process.env.MAX_WORD_COUNT || '50000', 10),
  minWordCount: parseInt(process.env.MIN_WORD_COUNT || '500', 10),
  
  // Transcript processing
  transcriptChunkThreshold: parseInt(process.env.TRANSCRIPT_CHUNK_THRESHOLD || '30000', 10),
  
  // Rate limiting
  rateLimitRequestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10', 10),
  rateLimitIntervalMs: parseInt(process.env.RATE_LIMIT_INTERVAL_MS || '60000', 10),
  rateLimitMaxTrackedIps: parseInt(process.env.RATE_LIMIT_MAX_TRACKED_IPS || '500', 10),
}

// Helper function to get the current configuration
export function getConfig() {
  return config;
}
