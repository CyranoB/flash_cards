# Active Context: AI Study Companion (As of 2025-03-26 ~9:20 PM ET)

## 1. Current Focus

-   Resolving issues related to PDF document upload and text extraction.
-   Implementing a frontend file size limit to prevent errors with large files.

## 2. Recent Changes

-   **PDF Extraction Library:**
    -   Attempted to use `pdf-parse` but encountered runtime errors (`ENOENT` related to internal test files). Library is old (v1.1.1 is latest). Removed dependency.
    -   Attempted to use `pdfjs-dist` (already a dependency) but faced persistent issues with worker loading/path resolution in the Next.js server environment (errors like `Invalid workerSrc type`, `Setting up fake worker failed`, `Cannot find module pdf.worker.mjs`). Tried various configurations (`workerSrc = null`, `workerSrc = ''`, relative path, `require.resolve`, legacy build, pre-importing worker) without success.
    -   **Switched to `pdf-text-extract`:** This library requires writing the PDF to a temporary file server-side but avoids the worker/bundling issues.
        -   Installed `pdf-text-extract`.
        -   Updated `/api/pdf-extract/route.ts` to save the file temporarily, call `extract`, and clean up the temp file.
        -   Resolved import issues by using `require` instead of `import`.
        -   Created a custom type declaration file (`types/pdf-text-extract.d.ts`) as official types are unavailable.
-   **File Size Limit:**
    -   Encountered Redis request size limit errors when processing large PDFs (due to storing the full extracted text in the job status).
    -   Implemented a frontend file size check in `components/upload.tsx` using a configurable limit.
    -   Updated `lib/config.ts` to use `NEXT_PUBLIC_MAX_FILE_SIZE_MB` (defaulting to 25MB) so the limit is available client-side.
    -   Corrected hardcoded "100MB" limit in the error message translation string (`lib/translations.ts`) by using a `{limit}` placeholder and updating `components/upload.tsx` to replace it dynamically.

## 3. Next Steps (Immediate)

-   Create `progress.md` to complete Memory Bank initialization.
-   Update project documentation (`docs/`) if necessary to reflect the PDF library change and file size limit.
-   Consider alternative storage for large extracted text if the 25MB limit proves too restrictive for valid use cases (e.g., Vercel Blob, S3).

## 4. Active Decisions & Considerations

-   Using `pdf-text-extract` adds the overhead of temporary file I/O on the server.
-   The 25MB frontend limit prevents the Redis error but might block users with legitimately large (but valid) documents. The underlying issue of storing large text in Redis remains.
-   Peer dependency warnings in `pnpm install` logs might need investigation later.
