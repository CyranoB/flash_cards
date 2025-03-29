# Progress: AI Study Companion (As of 2025-03-27 ~9:30 PM ET)

## 1. What Works

-   **Basic Application Structure:** Next.js app with App Router, basic layout, and routing.
-   **UI:** Core UI components using Shadcn UI, including the file upload interface (`components/upload.tsx`).
-   **Configuration:** Centralized config (`lib/config.ts`) loading from environment variables. Client-side config exposure via `NEXT_PUBLIC_` prefix works.
-   **Internationalization:** Basic i18n setup with `lib/translations.ts` and `useLanguage` hook.
-   **Document Upload:** Users can select or drag-and-drop files.
-   **File Validation (Frontend):**
    -   Checks for allowed types (.txt, .docx, .pdf).
    -   Checks against configurable max file size (default 25MB) using `NEXT_PUBLIC_MAX_FILE_SIZE_MB`. Error message dynamically shows the correct limit.
    -   Checks word count limits for non-PDF files.
-   **Non-PDF Processing:** `.txt` and `.docx` files have text extracted directly on the client/server (using `mammoth` likely via `lib/document-converter.ts`) and validated.
-   **PDF Text Extraction (Server-side):**
    -   Switched from `pdf-text-extract` to `pdf-parse` to resolve Vercel deployment incompatibility (`pdftotext` dependency).
    -   API route (`/api/pdf-extract`) receives the file, reads the buffer, extracts text using `pdf-parse` (no temporary files needed).
    -   Asynchronous job status tracking via Redis (`pdf-job:{jobId}`) is implemented.
    -   Client polls status endpoint (`/api/pdf-extract/status/[jobId]`) and updates progress UI. The route handler was updated to correctly `await params` for Next.js 15 compatibility.
-   **Error Handling:** Basic error dialog (`components/error-dialog.tsx`) displays errors encountered during validation or processing.
-   **Build Process:** The `pdf-parse` library was patched using `pnpm patch` to remove debug code, resolving build failures.
-   **Flashcard Study Flow:**
    -   Basic flashcard viewer (`app/flashcards/page.tsx`) displays question/answer.
    -   AI generates flashcards in batches of 10 (`lib/ai.ts`).
    -   Navigation between cards and batches works.
    -   Summary page (`app/summary/page.tsx`) shows the last 10 cards studied and provides an option to finish (redirects to course overview). The option to generate more cards ("Do 10 More") has been removed.
    -   Skeleton loading state implemented for card generation.
    -   Card counter resets for each batch.

## 2. What's Left to Build / Verify

-   **AI Integration:** Verify the *MCQ* generation flow (flashcard generation works).
-   **Study Interfaces:** Implement the *MCQ quiz* interface. Flashcard viewer is mostly functional.
-   **Results Display:** Implement the page showing the generated course overview/outline.
-   **Session Management:** Further refinement of study session tracking if needed beyond the current flashcard/summary flow.
-   **Authentication Flow:** Integrate Clerk authentication more deeply if needed beyond basic setup.
-   **Deployment:** Configure and test deployment (e.g., on Vercel).
-   **Robustness/Edge Cases:** Further testing of PDF extraction, AI generation, and the study flows with various inputs and potential errors.
-   **Alternative Storage for Large Text:** Monitor need for alternative storage (Vercel Blob, S3) for extracted text if Redis limits become an issue.

## 3. Current Status

-   Core file upload and text extraction pipeline is functional for .txt, .docx, and .pdf files.
-   Background processing for PDFs with status polling works.
-   Frontend validation (size, type, word count) is in place.
-   Basic flashcard generation and study flow (including batching, summary, loading states, counter) is functional.

## 4. Known Issues / Blockers

-   **Redis Size Limit (Potential):** While mitigated by the frontend limit, storing large extracted text (even from <25MB PDFs) in Redis might still hit limits or be inefficient. This needs monitoring or a proactive change to alternative storage.
-   **Peer Dependency Warnings:** Warnings exist during `pnpm install` related to React/date-fns versions. Need investigation if they cause runtime issues.
-   **`pdf-parse` Limitations:** Need to verify its performance and accuracy with various PDF structures, especially complex ones, during testing.
