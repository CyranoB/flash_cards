# AI Flashcard Generator - Application Flow Document

> **Key Points**
> - User journey follows a linear path: Upload → Processing → Results → Study Mode → Summary
> - Client-side storage (sessionStorage) maintains state between page transitions
> - AI operations are handled through a modular API architecture with dedicated controllers
> - Multi-language support for both UI elements and generated content
> - Comprehensive error handling and visual feedback throughout the flow

## Overview

The AI Flashcard Generator is a Next.js application that uses OpenAI's API to analyze course transcripts and generate study materials including flashcards and multiple choice questions. The application follows a clear linear flow from document upload to interactive study sessions.

## System Initialization

Before any user interaction, the application performs a server-side check for proper OpenAI API configuration:

- **Component**: `ServerConfigCheck` in `/components/server-config-check.tsx`
- If API key is missing or invalid, displays configuration instructions
- If properly configured, renders the application content

## Application Flow

### 1. Home Page (Upload)

**Path**: `/app/page.tsx`  
**Primary Component**: `Upload` from `/components/upload.tsx`

**User Flow**:
- User lands on the homepage
- User can toggle language (English/French) and theme (Light/Dark)
- User uploads a document (TXT, DOCX, or PDF format)
- File is validated for format and size (500-50,000 words)
- For PDF files, a visual progress indicator shows extraction status

**Technical Implementation**:
- Client-side file processing using `/lib/document-converter.ts`
- PDF processing via `usePdfText` hook with non-blocking extraction:
  - Uses web workers to prevent UI freezing
  - Implements timeout handling to prevent hanging
  - Provides visual progress feedback during extraction
  - Handles extraction errors with clear user feedback
  - Works seamlessly with authentication flows
- Extracted text stored in `sessionStorage` as "transcript"
- User is redirected to the processing page

### 2. Processing Page

**Path**: `/app/processing/page.tsx`

**User Flow**:
- User sees a loading indicator with progress bar
- System analyzes the transcript content
- Automatic redirection to results page when complete

**Technical Implementation**:
- Retrieves transcript from `sessionStorage`
- Calls `analyzeTranscript()` from `/lib/ai.ts` to process text
- Shows progress indicators (simulated incremental progress)
- Stores analysis results in `sessionStorage` as "courseData"
- Stores the content language in `sessionStorage` as "contentLanguage"
- Redirects to `/results` when processing completes

### 3. Results Page

**Path**: `/app/results/page.tsx`

**User Flow**:
- User sees the analyzed course subject
- User sees an outline of key points extracted from the document
- User can choose between flashcards or multiple choice questions
- User clicks "I'm Ready" to proceed to their chosen study mode

**Technical Implementation**:
- Retrieves course data from `sessionStorage`
- Displays subject and outline sections
- "I'm Ready" button redirects to either `/flashcards` or `/mcq` based on user selection

### 4a. Flashcards Page

**Path**: `/app/flashcards/page.tsx`

**User Flow**:
- User views flashcards generated from the document
- User can toggle between question and answer views
- User navigates to the next flashcard
- Additional flashcards are generated automatically as needed
- User can stop the session to see a summary

**Technical Implementation**:
- Retrieves course data and transcript from `sessionStorage`
- Uses `generateFlashcards()` to create batches of 10 flashcards
- Handles question/answer toggling with state management
- Automatically generates more cards when the user reaches the end of current set
- Stores all studied flashcards in `sessionStorage` when stopped
- Redirects to `/summary` when user stops the session

### 4b. MCQ Page

**Path**: `/app/mcq/page.tsx`

**User Flow**:
- User views multiple choice questions generated from the document
- User selects an answer from four options (A, B, C, D)
- User receives immediate feedback on their answer choice with clear visual indicators:
  - Correct answers highlighted in emerald/green with improved contrast
  - Incorrect answers highlighted in rose/red with improved contrast
- User can navigate to the next question or stop the session
- Additional questions are generated automatically as needed

**Technical Implementation**:
- Retrieves course data and transcript from `sessionStorage`
- Uses `generateMcqs()` to create a batch of questions
- Handles answer selection and validation
- Provides enhanced visual feedback for correct/incorrect answers:
  - Light mode: emerald-100/rose-100 backgrounds with emerald-500/rose-500 borders
  - Dark mode: emerald-900/rose-900 backgrounds with emerald-500/rose-500 borders
- Tracks user performance and session statistics
- Stores session data in `sessionStorage` when stopped
- Redirects to `/mcq-summary` when user stops the session

### 5a. Flashcard Summary Page

**Path**: `/app/summary/page.tsx`

**User Flow**:
- User sees a list of all flashcards studied in the session
- User can review all questions and answers
- User clicks "Finish" to end the session and return to homepage

**Technical Implementation**:
- Retrieves flashcards from `sessionStorage`
- Displays all flashcards with questions and answers
- "Finish" button clears `sessionStorage` and redirects to homepage

### 5b. MCQ Summary Page

**Path**: `/app/mcq-summary/page.tsx`

**User Flow**:
- User sees their quiz performance statistics:
  - Overall score percentage
  - Time spent on the quiz
  - Number of correct answers (highlighted in emerald)
  - Number of incorrect answers (highlighted in rose)
- User can review all questions with:
  - The question text
  - All answer options
  - Their selected answer
  - The correct answer
  - Enhanced visual indicators for correct/incorrect choices with improved contrast
- User clicks "Start New" to return to homepage

**Technical Implementation**:
- Retrieves MCQ session data from `sessionStorage`
- Calculates and displays performance metrics
- Shows detailed review of all questions and answers
- Provides enhanced visual feedback through color-coding:
  - Light mode:
    - Correct answers: emerald-100 background with emerald-500 border
    - Incorrect answers: rose-100 background with rose-500 border
  - Dark mode:
    - Correct answers: emerald-900/30 background with emerald-500 border
    - Incorrect answers: rose-900/30 background with rose-500 border
- "Start New" button clears `sessionStorage` and redirects to homepage

## Data Management

The application uses `sessionStorage` to maintain state between pages:

1. **transcript**: Raw text extracted from the uploaded document
2. **courseData**: JSON object with subject and outline generated by AI
3. **contentLanguage**: Language used for content generation (en/fr)
4. **flashcards**: Array of all studied flashcards
5. **mcqSessionData**: Object containing MCQ session details:
   - questions: Array of all MCQ questions with user responses
   - score: Number of correct answers
   - totalQuestions: Total number of questions
   - startTime: Session start timestamp
   - isComplete: Session completion status

## API Integration

The application communicates with AI services through a modular API architecture:

**Main Endpoint**: `POST /api/ai/route.ts`

**Architecture**:
- **Route Handler**: Entry point that handles request validation, rate limiting, and routes to appropriate controllers
- **Controllers**: Operation-specific handlers in `/lib/ai/controller.ts`
- **Services**: Core AI functionality in `/lib/ai/service.ts`
- **Prompts**: Templated prompts in `/lib/ai/prompts.ts`

**Operations**:
- `analyze`: Processes transcript to extract subject and outline
  - Controller: `handleAnalyze()`
  - Service: `analyzeTranscript()`
  
- `generate-batch`: Creates multiple flashcards in one request (batch of 10)
  - Controller: `handleGenerateBatch()`
  - Service: `generateFlashcards()`
  
- `generate-mcq-batch`: Creates multiple choice questions with smart distractors
  - Controller: `handleGenerateMCQBatch()`
  - Service: `generateMCQs()`

**Security Features**:
- IP validation and rate limiting via `/lib/middleware.ts`
- Request body validation with size limits
- Comprehensive error handling and logging
- Response parsing with markdown cleaning for robust JSON handling

**Data Flow**:
1. Client sends request to `/api/ai` endpoint
2. Route handler validates request and applies rate limiting
3. Request is routed to the appropriate controller
4. Controller extracts parameters and calls service function
5. Service generates prompt using templates and makes AI request
6. Response is cleaned, parsed, and returned to client
7. Client receives JSON data for rendering

## Language Support

The application implements dual language support:

1. **UI Language**
   - Managed by `LanguageProvider` from `/hooks/use-language.tsx`
   - User can toggle between English and French
   - UI elements use translations from `/lib/translations.ts`

2. **Content Language**
   - Initially matches UI language
   - Used for generating AI content in the appropriate language
   - Persists throughout the session for consistency

## Error Handling

Each page includes comprehensive error handling:
- Checks for missing data in `sessionStorage` (redirects to home)
- Handles AI processing failures with error toasts
- Provides clear feedback for configuration issues

## User Experience Enhancements

- **Progress Indicators**: Visual feedback during AI processing
- **Loading States**: Clear indication when system is generating content
- **Toast Notifications**: Status updates and error messages
- **Mobile Optimization**: Responsive design for all device sizes