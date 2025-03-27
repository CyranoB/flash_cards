# Progress: AI Study Companion (As of 2025-03-26 ~9:20 PM ET)

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
    -   Successfully switched to `pdf-text-extract`.
    -   API route (`/api/pdf-extract`) receives the file, saves it temporarily, extracts text using `pdf-text-extract`, and cleans up.
    -   Asynchronous job status tracking via Redis (`pdf-job:{jobId}`) is implemented.
    -   Client polls status endpoint (`/api/pdf-extract/status/[jobId]`) and updates progress UI.
-   **Error Handling:** Basic error dialog (`components/error-dialog.tsx`) displays errors encountered during validation or processing.

## 2. What's Left to Build / Verify

-   **AI Integration:** Verify the flow where extracted text (from session storage) is sent to the AI API (`/api/ai`) for analysis/generation.
-   **Study Interfaces:** Implement the flashcard viewer and MCQ quiz interfaces.
-   **Results Display:** Implement the page showing the generated course overview/outline.
-   **Session Management:** Implement study session tracking and summary display.
-   **Authentication Flow:** Integrate Clerk authentication more deeply if needed beyond basic setup.
-   **Deployment:** Configure and test deployment (e.g., on Vercel).
-   **Robustness/Edge Cases:** Further testing with different file types, sizes, and potential error conditions.
-   **Alternative Storage for Large Text:** Investigate and potentially implement alternative storage (Vercel Blob, S3) for extracted text if the 25MB limit + Redis storage proves problematic.

## 3. Current Status

-   The core file upload and text extraction pipeline is now functional for .txt, .docx, and .pdf files, including background processing for PDFs.
-   Frontend validation prevents excessively large files (default > 25MB) from being processed, mitigating Redis size limit errors for now.

## 4. Known Issues / Blockers

-   **Redis Size Limit (Potential):** While mitigated by the frontend limit, storing large extracted text (even from <25MB PDFs) in Redis might still hit limits or be inefficient. This needs monitoring or a proactive change to alternative storage.
-   **Peer Dependency Warnings:** Warnings exist during `pnpm install` related to React/date-fns versions. Need investigation if they cause runtime issues.
-   **`pdf-text-extract` Limitations:** Relies on temporary file storage server-side. May have its own limitations with complex PDFs (though it seems to work for the tested files).
