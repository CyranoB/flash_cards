# AI-Powered Flashcard Generator

A modern web application designed to help university students study more effectively by automatically generating flashcards from course transcripts using AI.

## Features

- **Transcript Upload**: Easily upload plain text transcript files
- **AI Analysis**: Automatic extraction of course subject and detailed outline
- **Flashcard Generation**: Create customizable sets of AI-generated flashcards
- **Interactive Study Interface**: Navigate through flashcards with simple controls
- **Multi-language Support**: Available in English and French
- **Duplicate Prevention**: Smart detection and filtering of similar flashcards
- **Study Session Summary**: Review all studied flashcards at the end of a session

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn UI components
- **AI Integration**: OpenAI-compatible API with support for various models
- **Deployment**: Serverless architecture

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
   OPENAI_API_KEY=your_api_key
   OPENAI_MODEL=gpt-4o-mini # or any other compatible model
   OPENAI_BASE_URL=https://api.openai.com/v1 # or your custom endpoint
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
3. **Flashcard Selection**: Users select how many flashcards they want to generate
4. **Flashcard Study**: Interactive flashcard interface with question/answer toggling
5. **Summary**: Review of all studied flashcards before starting a new session

## Key Components

- **Upload Component**: Handles file validation and extraction
- **Processing Page**: Shows real-time AI analysis progress
- **Flashcard Generator**: Creates and manages flashcards with deduplication
- **Error Dialog**: Provides clear feedback for any issues
- **Summary Page**: Displays session statistics and studied content

## Advanced Features

### Flashcard Deduplication

The application uses Jaccard similarity to detect and filter similar questions, preventing repetitive content:

- Detects semantic similarity between questions
- Automatically retries generation if too many duplicates are found
- Maintains variety throughout the study session

### Error Handling

Comprehensive error handling with detailed logging:

- API request/response logging for debugging
- User-friendly error dialogs
- Graceful fallbacks for network issues

## Customization

### Styling

The application uses Tailwind CSS with shadcn UI components for consistent styling. You can customize the theme in:
- `tailwind.config.js` - For color schemes and general styling
- `components/ui/*` - For individual component styling

### Language Support

To add or modify translations, edit the `lib/translations.ts` file.

## License

[MIT License](LICENSE) 