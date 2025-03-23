# Backend Structure Document

This document provides an overview of the backend structure for the AI Flashcard Generator, ensuring clarity in design for both technical and non-technical readers. It explains how the system processes course transcripts, interacts with AI, and manages temporary session data.

## Backend Architecture

The backend is built using serverless functions that operate in a stateless manner. The following design patterns and frameworks are used to ensure scalability, maintainability, and performance:

- **Next.js API Routes:** Core business logic (upload processing, AI analysis, flashcard generation, session management) is implemented as API routes within the Next.js framework, leveraging its built-in routing system.
- **Serverless Functions:** The API routes are deployed as serverless functions, promoting a decoupled architecture that scales on demand.
- **Configuration Management:** A centralized configuration file (`/lib/env.ts`) holds sensitive API keys (such as the OpenAI key), model configurations, and default URLs.
- **Stateless Sessions:** Session state for flashcard sequences and transcript processing is managed client-side using `sessionStorage`, ensuring no server-side state is maintained between requests.

## Data Management

The project does not use a traditional persistent database. Instead, it focuses on transient data storage and efficient data processing during each session:

- **Client-Side Storage:** `sessionStorage` is used to store temporary session data such as uploaded transcripts, course data, and generated flashcards.
- **Server-Side Processing:** Data is processed on-demand within serverless functions, with results sent back to the client for storage and display.

## API Design and Endpoints

The API is designed with a RESTful approach, implemented as Next.js API routes:

- **AI Processing Endpoint (POST /api/ai/route.ts):**
  - Handles multiple operations: transcript analysis, flashcard generation, and batch flashcard generation.
  - Accepts different `type` parameters to determine the operation: "analyze", "generate", or "generate-batch".
  - Interacts with OpenAI's API to process text and generate content.

## OpenAI Integration

The application integrates with OpenAI's API for natural language processing tasks:

- **AI SDK:** Utilizes the `@ai-sdk/openai` package for streamlined interaction with OpenAI's API.
- **Model Configuration:** Uses the GPT-4o-Mini model by default, configurable through environment variables.
- **Prompt Engineering:** Implements carefully crafted prompts for transcript analysis and flashcard generation, ensuring high-quality and relevant outputs.

## Language Support

The backend supports multilingual content generation:

- **Dynamic Language Selection:** The API accepts a `language` parameter to generate content in either English or French.
- **Localized Prompts:** AI prompts are dynamically adjusted based on the selected language.

## Security Measures

Security in this project is approached in several layers:

- **Environment Variables:** Sensitive configuration data, including the OpenAI API key, is stored in environment variables.
- **Server-Side Validation:** The `getOpenAIConfig` function in `/lib/env.ts` ensures proper configuration of OpenAI credentials before processing requests.
- **Input Validation:** API routes implement checks to ensure valid input data before processing.
- **CORS:** By default, Next.js API routes are protected against cross-origin requests.

## Error Handling

The API implements comprehensive error handling:

- **Try-Catch Blocks:** All API operations are wrapped in try-catch blocks to catch and handle exceptions.
- **Specific Error Responses:** Different types of errors (e.g., configuration errors, processing errors) return appropriate HTTP status codes and error messages.
- **Client-Side Feedback:** Errors are communicated back to the client for display to the user via toast notifications.

## Performance Considerations

Several measures are in place to optimize performance:

- **Serverless Architecture:** Enables automatic scaling based on demand.
- **Efficient Data Processing:** The AI processing is optimized to handle requests quickly, with progress indicators on the client side to provide feedback during longer operations.
- **Batched Flashcard Generation:** Implements a "generate-batch" operation to create multiple flashcards in a single API call, reducing the number of requests for better performance.

## Monitoring and Maintenance

While specific monitoring tools are not explicitly implemented in the provided code, the serverless nature of the application allows for:

- **Automatic Scaling:** The serverless functions automatically scale based on demand.
- **Built-in Logging:** Next.js and the serverless platform provide built-in logging capabilities for debugging and monitoring.

## Conclusion

The backend of the AI Flashcard Generator is designed to be scalable, secure, and efficient. It leverages Next.js API routes and serverless functions to provide a robust platform for AI-powered flashcard generation. The stateless architecture, combined with client-side storage, ensures a responsive user experience while maintaining data privacy and minimizing server-side complexity.
