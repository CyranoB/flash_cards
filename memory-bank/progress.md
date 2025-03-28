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

## 2. What's Left to Build / Verify

-   **AI Integration:** Verify the flow where extracted text (from session storage) is sent to the AI API (`/api/ai`) for analysis/generation.
-   **Study Interfaces:** Implement the flashcard viewer and MCQ quiz interfaces.
-   **Results Display:** Implement the page showing the generated course overview/outline.
-   **Session Management:** Implement study session tracking and summary display.
-   **Authentication Flow:** Integrate Clerk authentication more deeply if needed beyond basic setup.
-   **Deployment:** Configure and test deployment (e.g., on Vercel) - The switch to `pdf-parse` should resolve the previous blocker.
-   **Robustness/Edge Cases:** Further testing with different file types, sizes, potential PDF complexities (`pdf-parse` limitations?), and error conditions.
-   **Alternative Storage for Large Text:** Investigate and potentially implement alternative storage (Vercel Blob, S3) for extracted text if the 25MB limit + Redis storage proves problematic.

## 3. Current Status

-   The core file upload and text extraction pipeline is functional for .txt, .docx, and .pdf files, using `pdf-parse` for PDFs in a Vercel-compatible way.
-   Background processing for PDFs remains functional.
-   Frontend validation prevents excessively large files (default > 25MB) from being processed, mitigating Redis size limit errors for now.

## 4. Known Issues / Blockers

-   **Redis Size Limit (Potential):** While mitigated by the frontend limit, storing large extracted text (even from <25MB PDFs) in Redis might still hit limits or be inefficient. This needs monitoring or a proactive change to alternative storage.
-   **Peer Dependency Warnings:** Warnings exist during `pnpm install` related to React/date-fns versions. Need investigation if they cause runtime issues.
-   **`pdf-parse` Limitations:** Need to verify its performance and accuracy with various PDF structures, especially complex ones, during testing.
