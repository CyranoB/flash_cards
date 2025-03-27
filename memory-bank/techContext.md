# Tech Context: AI Study Companion

## 1. Core Technologies

-   **Framework:** Next.js (v15.2.3) with App Router
-   **Language:** TypeScript (v5)
-   **UI Library:** React (v19), Shadcn UI
-   **Styling:** Tailwind CSS
-   **Package Manager:** pnpm (v10.4.1)
-   **AI Integration:** `@ai-sdk/openai` (v1.2.5), `ai` (v4.1.61)
-   **Document Processing:**
    -   `.docx`: `mammoth` (v1.9.0)
    -   `.pdf`: `pdf-text-extract` (v1.5.0) - Chosen after issues with `pdf-parse` and `pdfjs-dist`. Requires writing to temp file server-side.
    -   Custom type declaration created (`types/pdf-text-extract.d.ts`) as `@types/pdf-text-extract` does not exist.
-   **Background Job/State:** Redis via `@upstash/redis` (v1.34.6) - Used for tracking PDF extraction job status.
-   **Authentication:** Clerk (`@clerk/nextjs` v6.12.9)
-   **Linting/Formatting:** Likely ESLint/Prettier (inferred from standard Next.js setup, though not explicitly confirmed).

## 2. Development Setup

-   Run locally using `pnpm dev`.
-   Environment variables managed via `.env.local` (and potentially `.env`).
    -   `NEXT_PUBLIC_MAX_FILE_SIZE_MB`: Controls client-side file upload limit (default 25MB).
    -   Other variables likely exist for OpenAI API Key, Clerk keys, Redis connection, etc. (See `.env.example`).

## 3. Technical Constraints & Considerations

-   **PDF Library Issues:** Encountered significant problems getting `pdf-parse` and `pdfjs-dist` to work reliably server-side within the Next.js bundled environment, primarily due to worker loading and path resolution issues exacerbated by `pnpm`. Settled on `pdf-text-extract` which requires temporary file storage.
-   **Redis Request Size Limit:** Storing large extracted text directly in Redis job status can exceed limits (e.g., Upstash's 1MB default). This was mitigated by adding a frontend file size limit, but storing large results might require alternative storage (e.g., Vercel Blob, S3) if the 25MB limit proves insufficient for valid use cases later.
-   **Client-Side Environment Variables:** Variables needed in client components (like `maxFileSizeMB`) must be prefixed with `NEXT_PUBLIC_`.
-   **CommonJS vs. ESM:** Compatibility issues arose when importing `pdf-text-extract` (a likely CommonJS module) using ES Module `import`. Switched to `require`.

## 4. Dependencies

-   See `package.json` for a full list. Key dependencies related to recent work are listed in section 1.
-   Note peer dependency warnings related to `react-day-picker`, `vaul`, `react`, and `date-fns` versions. These might need addressing later but don't seem critical for current functionality.
