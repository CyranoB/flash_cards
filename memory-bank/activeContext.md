# Active Context - Flashcard Generator App

## Current Focus

Refactoring and improving the PDF upload and text extraction process. The main goal was to move PDF extraction to a background job handled by the backend API, add robust validation, and improve frontend state management.

## Recent Changes (This Session)

- **Refactored PDF Extraction:**
    - Moved `pdf-text-extract` logic from the frontend (`usePdfText.ts` hook - now removed) to a new backend API route (`app/api/pdf-extract/route.ts`).
    - Implemented a background job pattern using Redis to track progress (`processing`, `completed`, `failed`).
    - Created a status API route (`app/api/pdf-extract/status/[jobId]/route.ts`) for the frontend to poll.
- **Improved Validation:**
    - Added backend validation (file type, size) in `app/api/pdf-extract/route.ts`.
    - Added frontend checks for file type, size, and word count (min/max) in `components/upload.tsx`. Word count for PDFs is checked *after* successful extraction.
- **Enhanced Frontend (`components/upload.tsx`):**
    - Removed the `usePdfText` hook dependency.
    - Added state (`jobId`, `isProcessing`, `extractionProgress`) to manage the background PDF extraction process.
    - Implemented polling logic using `useEffect` to check the job status API.
    - Added `validatedText` state to store extracted text from TXT/DOCX files during initial validation, preventing redundant extraction later.
    - Updated UI to show progress for PDF extraction.
    - Improved state reset logic when changing files or encountering errors.
    - Refined the logic for enabling the 'Upload' (Proceed) button based on file type and processing status.
- **Configuration Improvements (`lib/config.ts`):**
    - Refactored to use a `safeParseInt` helper function for robustness against invalid environment variables.
    - Made the code DRYer by reading env vars once where appropriate.
- **Code Cleanup:**
    - Removed the unused `usePdfText.ts` hook and its worker file (`public/workers/pdf.worker.js`).
    - Removed unused imports and console logs.
    - Fixed various TypeScript errors introduced during refactoring.
    - **Patched `pdf-parse`:** Applied a patch using `pnpm patch` to remove problematic debug code in `pdf-parse` that was causing build failures.
    - **Fixed Status Route:** Updated `app/api/pdf-extract/status/[jobId]/route.ts` to correctly `await params` as required by Next.js 15.

## Next Steps

- Thoroughly test the updated PDF upload flow with various file types (PDF, TXT, DOCX), sizes (including edge cases around limits), and potential error conditions, especially on Vercel.
- Consider adding more granular progress updates for PDF extraction if feasible (e.g., based on pages processed), although the current implementation (start, mid, end) is functional.
- Review overall error handling and user feedback for clarity.
