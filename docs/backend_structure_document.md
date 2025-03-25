# Backend Structure Document

> **Key Points**
> - Serverless architecture with Next.js API routes for scalability
> - Stateless design with client-side session storage
> - RESTful API approach with operation-based routing
> - Web Worker-based PDF processing for non-blocking text extraction
> - OpenAI integration for AI processing
> - Comprehensive error handling and logging
> - Configurable file size and word count limits via environment variables

This document provides an overview of the backend structure for the AI Flashcard Generator, ensuring clarity in design for both technical and non-technical readers. It explains how the system processes course transcripts, interacts with AI, and manages temporary session data.

## Backend Architecture

The backend is built using serverless functions that operate in a stateless manner. The following design patterns and frameworks are used to ensure scalability, maintainability, and performance:

- **Next.js API Routes:** Core business logic (upload processing, AI analysis, flashcard generation, session management) is implemented as API routes within the Next.js framework, leveraging its built-in routing system.
- **Serverless Functions:** The API routes are deployed as serverless functions, promoting a decoupled architecture that scales on demand.
- **Configuration Management:** A centralized configuration system (`/lib/config.ts`) manages environment variables for file size limits, word counts, API keys, and other configurable parameters.
- **Stateless Sessions:** Session state for flashcard sequences and transcript processing is managed client-side using `sessionStorage`, ensuring no server-side state is maintained between requests.
- **Web Worker Processing:** PDF text extraction is handled by Web Workers in a separate thread to prevent UI blocking, with timeout handling and progress tracking.

## Data Management

The project does not use a traditional persistent database. Instead, it focuses on transient data storage and efficient data processing during each session:

- **Client-Side Storage:** `sessionStorage` is used to store temporary session data such as uploaded transcripts, course data, and generated flashcards.
- **Server-Side Processing:** Data is processed on-demand within serverless functions, with results sent back to the client for storage and display.
- **PDF Processing:** PDF documents are processed client-side using Web Workers to extract text without blocking the UI thread, with progress tracking and timeout handling.

## API Design and Endpoints

The API is designed with a RESTful approach, implemented as Next.js API routes:

- **AI Processing Endpoint (POST /api/ai/route.ts):**
  - Handles multiple operations: transcript analysis, flashcard generation, and batch flashcard generation.
  - Accepts different `type` parameters to determine the operation: "analyze", "generate", or "generate-batch".
  - Interacts with OpenAI's API to process text and generate content.
  - Implements validation for request body size and word count limits.

## OpenAI Integration

The application integrates with OpenAI's API for natural language processing tasks:

- **AI SDK:** Utilizes the `@ai-sdk/openai` package for streamlined interaction with OpenAI's API.
- **Model Configuration:** Uses the GPT-4o-Mini model by default, configurable through environment variables.
- **Prompt Engineering:** Implements carefully crafted prompts for transcript analysis and flashcard generation, ensuring high-quality and relevant outputs.
- **Large Transcript Handling:** For transcripts exceeding the configured character threshold, the system automatically extracts a representative sample to optimize API usage.

## Configuration System

The application uses a centralized configuration system (`/lib/config.ts`) that provides:

- **File Size Limits:**
  - `MAX_FILE_SIZE_MB`: Maximum allowed file size in megabytes (default: 100MB)
  - `maxFileSizeBytes`: Calculated value in bytes for internal validation

- **Word Count Limits:**
  - `MAX_WORD_COUNT`: Maximum allowed word count in a transcript (default: 50,000)
  - `MIN_WORD_COUNT`: Minimum required word count for meaningful analysis (default: 500)

- **Transcript Processing:**
  - `TRANSCRIPT_CHUNK_THRESHOLD`: Character threshold for transcript chunking (default: 30,000)
  - When a transcript exceeds this threshold, the system extracts a representative sample

- **Rate Limiting:**
  - `RATE_LIMIT_REQUESTS_PER_MINUTE`: Maximum requests allowed per IP (default: 10)
  - `RATE_LIMIT_INTERVAL_MS`: Time window for rate limiting (default: 60,000ms)
  - `RATE_LIMIT_MAX_TRACKED_IPS`: Maximum number of tracked IPs (default: 500)

These configuration values can be adjusted via environment variables without code changes, allowing for flexible deployment in different environments.

## Language Support

The backend supports multilingual content generation:

- **Dynamic Language Selection:** The API accepts a `language` parameter to generate content in either English or French.
- **Localized Prompts:** AI prompts are dynamically adjusted based on the selected language.

## Security Measures

Security in this project is approached in several layers:

- **Environment Variables:** Sensitive configuration data, including the OpenAI API key, is stored in environment variables.
- **Server-Side Validation:** The `getOpenAIConfig` function in `/lib/env.ts` ensures proper configuration of OpenAI credentials before processing requests.
- **Input Validation:** API routes implement checks to ensure valid input data before processing.
- **Size Validation:** Requests are validated against configurable size limits to prevent resource exhaustion.
- **CORS:** By default, Next.js API routes are protected against cross-origin requests.

## Error Handling

The API implements comprehensive error handling:

- **Try-Catch Blocks:** All API operations are wrapped in try-catch blocks to catch and handle exceptions.
- **Specific Error Responses:** Different types of errors (e.g., configuration errors, processing errors) return appropriate HTTP status codes and error messages.
- **Size Limit Errors:** Provides clear error messages when file size or word count limits are exceeded.
- **Client-Side Feedback:** Errors are communicated back to the client for display to the user via toast notifications.

## Performance Considerations

Several measures are in place to optimize performance:

- **Serverless Architecture:** Enables automatic scaling based on demand.
- **Web Worker-based PDF Processing:** Handles resource-intensive PDF text extraction in a separate thread to keep the UI responsive.
- **Timeout Handling:** Prevents PDF extraction from running indefinitely.
- **Transcript Chunking:** Large transcripts are automatically sampled to optimize API usage and response times.
- **Configurable Limits:** File size and word count limits can be adjusted based on deployment environment and resource constraints.

## Monitoring and Maintenance

While specific monitoring tools are not explicitly implemented in the provided code, the serverless nature of the application allows for:

- **Automatic Scaling:** The serverless functions automatically scale based on demand.
- **Built-in Logging:** Next.js and the serverless platform provide built-in logging capabilities for debugging and monitoring.

## Conclusion

The backend of the AI Flashcard Generator is designed to be scalable, secure, and efficient. It leverages Next.js API routes and serverless functions to provide a robust platform for AI-powered flashcard generation. The stateless architecture, combined with client-side storage, ensures a responsive user experience while maintaining data privacy and minimizing server-side complexity.
