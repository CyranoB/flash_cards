# AI-Powered Flashcard Generator

A modern web application designed to help university students study more effectively by automatically generating flashcards and multiple choice questions from course transcripts using AI.

## Features

- **Transcript Upload**: Easily upload plain text transcript files
- **PDF Processing**: Robust PDF text extraction with timeout handling and progress feedback
- **AI Analysis**: Automatic extraction of course subject and detailed outline
- **Flashcard Generation**: Create customizable sets of AI-generated flashcards
- **Multiple Choice Questions**: Generate and take AI-powered MCQ quizzes with enhanced visual feedback
- **Interactive Study Interface**: Navigate through flashcards and MCQs with simple controls
- **Multi-language Support**: Available in English and French
- **Duplicate Prevention**: Smart detection and filtering of similar flashcards and questions
- **Study Session Summary**: Review all studied content with detailed performance metrics and visual feedback
- **Accessibility**: High-contrast color schemes for improved readability in both light and dark modes
- **Security Features**: Rate limiting, request validation, and comprehensive logging

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn UI components
- **AI Integration**: OpenAI-compatible API with support for various models
- **Deployment**: Serverless architecture
- **Security**: LRU-based rate limiting and request validation

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key or compatible API (Anthropic, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/flashcard-generator.git
   cd flashcard-generator
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```
   # OpenAI Configuration
   OPENAI_API_KEY=your_api_key
   OPENAI_MODEL=gpt-4o-mini # or any other compatible model
   OPENAI_BASE_URL=https://api.openai.com/v1 # or your custom endpoint

   # Rate Limiting Configuration (optional)
   RATE_LIMIT_REQUESTS_PER_MINUTE=10 # Default: 10
   RATE_LIMIT_INTERVAL_MS=60000 # Default: 60000 (60 seconds)
   RATE_LIMIT_MAX_TRACKED_IPS=500 # Default: 500 (maximum concurrent IPs to track)
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Build for production:
   ```bash
   pnpm build
   ```

## Application Flow

1. **Upload**: Users upload a transcript file on the home page
2. **Processing**: The AI analyzes the transcript to extract course subject and outline
3. **Study Mode Selection**: Users choose between flashcards or multiple choice questions
4. **Interactive Study**: 
   - **Flashcard Mode**: Interactive flashcard interface with question/answer toggling
   - **MCQ Mode**: Multiple choice questions with immediate feedback and scoring
5. **Summary**: Detailed review of study session with performance metrics and content review

## Key Components

- **Upload Component**: Handles file validation and extraction with enhanced PDF processing
- **PDF Processing**: Non-blocking PDF text extraction with timeout handling and visual progress feedback
- **Processing Page**: Shows real-time AI analysis progress
- **Flashcard Generator**: Creates and manages flashcards with deduplication
- **MCQ Generator**: Creates multiple choice questions with smart answer options and accessible color feedback
- **Error Dialog**: Provides clear feedback for any issues
- **Summary Pages**: Display session statistics, performance metrics, and studied content with enhanced visual feedback

## Code Architecture

The application follows a modular architecture for improved maintainability:

### API Layer
- **Route Handlers**: `/app/api/ai/route.ts` - Main entry point for AI operations with request validation and error handling
- **Controllers**: `/lib/ai/controller.ts` - Separate controllers for each operation type (analyze, generate-batch, generate-mcq-batch)
- **Services**: `/lib/ai/service.ts` - Core AI service logic with reusable functions for making AI requests and parsing responses

### Middleware
- **Request Validation**: `/lib/middleware.ts` - Validates incoming requests, IP addresses, and applies rate limiting
- **Error Handling**: `/lib/errors.ts` - Custom error types for different scenarios
- **Logging**: `/lib/logging.ts` - Centralized logging functions for consistent log formats

### AI Integration
- **Prompt Templates**: `/lib/ai/prompts.ts` - Separate file for all AI prompt templates
- **Response Parsing**: Robust parsing of AI responses with markdown cleaning
- **Error Recovery**: Detailed error logging for AI response parsing issues

## Advanced Features

### Flashcard Deduplication

The application uses Jaccard similarity to detect and filter similar questions, preventing repetitive content:

- Detects semantic similarity between questions
- Automatically retries generation if too many duplicates are found
- Maintains variety throughout the study session

### PDF Processing

The application implements robust PDF text extraction:

- **Non-blocking Processing**: Extracts text without freezing the UI
- **Timeout Handling**: Automatically cancels extractions that take too long
- **Visual Feedback**: Shows real-time progress indicators during extraction
- **Error Recovery**: Graceful handling of extraction failures with clear user feedback
- **Authentication Compatibility**: Works seamlessly with authentication flows

### Security Features

The application implements several security measures:

- **Rate Limiting**: Configurable rate limiting per IP:
  - Requests per minute (default: 10)
  - Time interval (default: 60 seconds)
  - Maximum concurrent IPs tracked (default: 500)
- **Request Validation**: 
  - Content size limits (100KB max)
  - Input validation for all parameters
  - Type checking for API operations
- **Error Handling**: Comprehensive error handling with detailed logging
- **Logging**: Structured logging of all API requests with:
  - Timestamp
  - Request type
  - IP address (anonymized)
  - Status code
  - Error details (when applicable)

### Error Handling

Comprehensive error handling with detailed logging:

- API request/response logging for debugging
- User-friendly error dialogs
- Graceful fallbacks for network issues
- Rate limit exceeded notifications

## Customization

### Styling

The application uses Tailwind CSS with shadcn UI components for consistent styling. You can customize the theme in:
- `tailwind.config.js` - For color schemes and general styling:
  - Light mode colors (emerald-100/rose-100 for feedback)
  - Dark mode colors (emerald-900/rose-900 for feedback)
  - Border colors (emerald-500/rose-500 for emphasis)
- `components/ui/*` - For individual component styling

### Language Support

To add or modify translations, edit the `lib/translations.ts` file.

### Security Configuration

You can customize security settings in:
- `lib/rate-limit.ts` - Adjust rate limiting parameters
- `app/api/ai/route.ts` - Modify request validation rules

## License

[MIT License](LICENSE) 