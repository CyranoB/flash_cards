# SmartDeck: AI-Powered Study Companion

SmartDeck is a web application that leverages artificial intelligence to help students create interactive study materials from their course transcripts. By uploading documents in formats such as PDF, DOCX, or TXT, users can generate flashcards and multiple-choice questions (MCQs) tailored to their coursework. With features like multilingual support, user authentication, and progress tracking, SmartDeck transforms traditional studying into an efficient, engaging experience.

## Description

SmartDeck is designed for students seeking smarter study methods. It uses AI to analyze uploaded transcripts, extract key concepts, and produce flashcards and MCQs. The application offers an intuitive interface for flipping through flashcards, taking quizzes with immediate feedback, and reviewing study session summaries. Built with modern web technologies, it ensures a seamless experience across devices.

## Technologies Used

- **Frontend**: Next.js (React framework), TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Redis for caching/session management
- **Authentication**: Clerk (optional, configurable)
- **AI Integration**: OpenAI API for content generation
- **File Processing**: pdf-parse (PDFs), mammoth (DOCX)
- **Icons**: Lucide React
- **Utilities**: LRU-cache for rate limiting, UUID for job IDs

## Installation Instructions

To set up SmartDeck locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/flash_cards.git
   cd flash_cards
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install  # Preferred, as indicated by pnpm-lock.yaml
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory with the following:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key  # Optional
   CLERK_SECRET_KEY=your_clerk_secret_key  # Optional
   ```
   - **OPENAI_API_KEY**: Required for AI functionality (get it from OpenAI).
   - **Clerk Keys**: Optional, for enabling authentication (get from Clerk dashboard).

4. **Run the Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser to access the app.

## Usage Instructions

1. **Access the Application**:
   Navigate to `http://localhost:3000` after starting the server.

2. **Sign In (Optional)**:
   If Clerk authentication is enabled, sign in or register via the auth header.

3. **Upload a Transcript**:
   - Go to the homepage (`/start`).
   - Use the upload component to select a PDF, DOCX, or TXT file.
   - Click "Process Transcript" to analyze the file.

4. **Choose Study Mode**:
   - After processing, select "Flashcards" or "Multiple Choice" from the course overview (`/course-overview`).

5. **Study with Flashcards**:
   - View questions, click "Show Answer" to flip, and proceed with "Next Card".
   - End the session with "End Session" to see a summary.

6. **Take an MCQ Quiz**:
   - Select answers, submit for feedback, and proceed until completion.
   - Review results on the quiz summary page.

7. **Review Progress**:
   - Check session summaries (`/summary` for flashcards, `/mcq-summary` for MCQs).

**Example**:
- Upload a biology lecture PDF.
- Generate 10 flashcards or MCQs.
- Study and track your progress.

## Features

- **AI-Driven Content Generation**: Automatically creates flashcards and MCQs from transcripts.
- **Multilingual Support**: Interface and content in English and French.
- **Authentication**: Optional Clerk-based sign-in for personalized use.
- **Interactive Study Modes**: Flashcard flipping and MCQ quizzes with feedback.
- **Progress Tracking**: Summaries of study sessions with stats like accuracy and time spent.
- **Responsive Design**: Works on desktop and mobile devices.
- **File Support**: Handles PDF, DOCX, and TXT formats.

## API Reference

SmartDeck includes internal API routes for core functionality:

- **`/api/pdf-extract`**:
  - **Method**: POST
  - **Purpose**: Uploads and extracts text from PDFs.
  - **Body**: `{ file: File }` (form-data)
  - **Response**: `{ jobId: string }`

- **`/api/pdf-extract/status/[jobId]`**:
  - **Method**: GET
  - **Purpose**: Checks extraction job status.
  - **Response**: `{ status: string, progress: number, result?: string }`

- **`/api/ai`**:
  - **Method**: POST
  - **Purpose**: Handles AI operations (analyze, generate flashcards/MCQs).
  - **Body**: 
    - Analyze: `{ type: "analyze", transcript: string, language: string }`
    - Flashcards: `{ type: "generate-batch", courseData: object, transcript: string, count: number, language: string }`
    - MCQs: `{ type: "generate-mcq-batch", courseData: object, transcript: string, count: number, language: string }`
  - **Response**: Varies by operation (e.g., `{ flashcards: Array }`).

Detailed documentation is in [`docs/API_ARCHITECTURE.md`](./docs/API_ARCHITECTURE.md).

## Contributing Guidelines

We welcome contributions! To get started:

1. **Fork and Clone**:
   Fork the repo and clone it locally.

2. **Set Up Development**:
   Follow the installation steps above.

3. **Code Standards**:
   - Use TypeScript with strict mode.
   - Follow existing naming and structure conventions.
   - Use Tailwind CSS for styling.

4. **Submit Changes**:
   - Create a branch: `git checkout -b feature/your-feature`.
   - Commit changes: `git commit -m "Add your message"`.
   - Push and open a pull request on GitHub.

5. **Testing**:
   Add tests in the `test` directory if applicable.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) (create if not present) for more details.

## License Information

SmartDeck is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details. (Note: If no LICENSE file exists, assume MIT as a common default and add one.)

For questions or support, feel free to reach out!