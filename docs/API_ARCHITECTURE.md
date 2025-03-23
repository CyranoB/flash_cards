# API Architecture Documentation

This document outlines the architecture of the AI API implementation in the Flash Cards application, focusing on the recent refactoring for improved maintainability.

## Overview

The AI API is built using Next.js 14 App Router with Route Handlers, providing a serverless architecture for AI operations. The codebase has been refactored to follow a modular design with clear separation of concerns.

## Directory Structure

```
/app
  /api
    /ai
      route.ts            # Main API route handler
/lib
  /ai
    controller.ts         # Operation-specific controllers
    prompts.ts            # AI prompt templates
    service.ts            # AI service logic
  errors.ts               # Custom error types
  logging.ts              # Centralized logging
  middleware.ts           # Request validation and rate limiting
  env.ts                  # Environment configuration
  rate-limit.ts           # Rate limiting implementation
```

## Component Responsibilities

### Route Handler (`/app/api/ai/route.ts`)

The route handler serves as the entry point for all AI operations and has the following responsibilities:
- Extracting and validating client IP addresses
- Applying rate limiting
- Validating request bodies
- Routing requests to appropriate controllers
- Handling errors and generating appropriate HTTP responses

```typescript
export async function POST(request: Request) {
  // IP validation and rate limiting
  // Request body validation
  // Route to appropriate controller
  // Error handling
}
```

### Controllers (`/lib/ai/controller.ts`)

Controllers handle specific operation types and are responsible for:
- Extracting operation-specific parameters from request bodies
- Calling appropriate service functions
- Logging successful operations
- Handling operation-specific errors

```typescript
export async function handleAnalyze(body: any, ip: string) {
  // Extract parameters
  // Call service function
  // Log and return response
}
```

### Services (`/lib/ai/service.ts`)

The service layer contains the core business logic:
- Making AI requests with appropriate parameters
- Cleaning and parsing AI responses
- Handling AI-specific errors
- Providing typed interfaces for AI operations

```typescript
export async function analyzeTranscript(params: AnalyzeParams) {
  // Generate prompt
  // Make AI request
  // Parse and return response
}
```

### Prompt Templates (`/lib/ai/prompts.ts`)

This module contains all AI prompt templates:
- Separated by operation type
- Parameterized for dynamic content
- Includes language-specific instructions

```typescript
export const prompts = {
  analyze: (transcript: string, language: string) => `...`,
  generateBatch: (courseData, transcript, count, language) => `...`,
  // ...
}
```

### Middleware (`/lib/middleware.ts`)

The middleware module provides:
- IP validation and normalization
- Request body validation
- Rate limiting implementation
- Type definitions for middleware operations

```typescript
export function isValidIP(ip: string): boolean {
  // Validate IP format
}

export async function applyRateLimit(ip: string): Promise<RateLimitResult> {
  // Apply rate limiting
}
```

### Logging (`/lib/logging.ts`)

The logging module provides:
- Standardized log format
- Consistent timestamp generation
- Type-safe logging functions

```typescript
export function logApiRequest(type: string, ip: string, status: number, error?: string) {
  // Generate and log standardized format
}
```

## Error Handling

The application implements a comprehensive error handling strategy:
1. **Custom Error Types**: ValidationError, RateLimitError, ConfigurationError
2. **Operation-Specific Handling**: Each controller handles errors specific to its operation
3. **Fallback Handling**: The route handler provides fallback error handling
4. **Detailed Logging**: All errors are logged with relevant context

## Response Parsing

A key improvement in the refactored code is the robust handling of AI responses:
- The `cleanAIResponse` function removes markdown formatting
- JSON parsing is wrapped in try/catch blocks with detailed error logging
- The service layer provides type-safe parsing of responses

## Rate Limiting

Rate limiting is implemented using:
- LRU cache for tracking request counts by IP
- Configurable limits via environment variables
- Proper HTTP headers for rate limit information
- Graceful handling of rate limit errors

## Future Improvements

Potential future improvements to the architecture:
1. **Schema Validation**: Add Zod or similar for request/response schema validation
2. **Unit Testing**: Add comprehensive unit tests for each module
3. **Metrics Collection**: Add performance metrics collection
4. **Caching Layer**: Add response caching for frequently requested operations
5. **Circuit Breaker**: Implement circuit breaker pattern for AI service calls
