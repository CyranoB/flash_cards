# Active Context - Flashcard Generator App

## Current Focus

Reviewing the recent theme update applied to the landing page (`app/page.tsx`).

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
    - **Fixed Status Route:** Updated `app/api/pdf-extract/status/[jobId]/route.ts` to correctly `await params` as required by Next.js 15, and updated the TypeScript type definition for `params` to `Promise<{ jobId: string }>` to resolve linter warnings.
- **Landing Page Theme Update (`app/page.tsx`):**
    - Replaced hardcoded color classes (e.g., `bg-purple-600`, `text-indigo-500`, gradients) with theme-based Tailwind classes (e.g., `bg-primary`, `text-primary`, `bg-secondary/10`) to align with `globals.css` variables.
- **Flashcard Flow Updates (`app/flashcards/page.tsx`, `app/summary/page.tsx`):**
    - **Batch Limit:** At the 10th card of a batch, only a "Finish" button is shown, directing the user to the summary page.
    - **Summary Options:** The summary page now provides "Do 10 More" (starts next batch) and "Finish" (goes to course overview) buttons.
    - **Skeleton Loader:** Implemented a `Skeleton` component loading state for flashcards. Fixed logic to ensure it displays correctly when generating initial *and* subsequent batches.
    - **Button Layout:** Restored the original layout with "Stop" on the left and "Next" on the right for cards 1-9.
    - **Card Counter:** Updated the counter to reset and show 1-10 for each batch.
    - **Landing Page Theme Update (Warm Beige/Cream Theme):**
        - Updated the default light theme CSS variables in `app/globals.css` (`:root` block) based on user feedback and screenshot inspiration, using warmer beige/cream tones (`hsl(50, 25%, 97%)` for background/cards, `hsl(50, 20%, 94%)` for secondary/accent) while keeping the muted green primary color.
        - Added a new orange accent color (`--accent-orange: 30 80% 60%`) to `app/globals.css` and `tailwind.config.ts`.
    - **Strategic Theme Application (`app/page.tsx`):**
        - *Previous Step:* Applied theme colors strategically to landing page sections (using `bg-secondary`, `bg-background`, `bg-card`) and standardized inner card styles. *(This may need visual verification against the new warm theme).*
        - Changed the "AI-Powered Learning" badge background color from primary (green) to the new `bg-accent-orange`.
    - **Dark Theme Update:**
        - Updated the `.dark` CSS variables in `app/globals.css` to use dark grey backgrounds (`hsl(240, 5%, 10%)` / `hsl(240, 5%, 15%)`), light grey text (`hsl(240, 5%, 85%)`) as the primary color, and orange (`hsl(var(--accent-orange))`) for focus rings, inspired by a user-provided screenshot.
        - Modified the main call-to-action buttons in `app/page.tsx` to use the standard `bg-primary` (green) in light mode but `dark:bg-accent-orange` in dark mode for better visibility.
        - **Landing Page Styling Simplification & Refactoring:**
            - Replaced hardcoded `dark:bg-black/20` for inner card backgrounds (sample questions, features, how-it-works, testimonials) in `app/page.tsx` with `dark:bg-card/20` for better theme consistency.
            - Removed unused `stepGradients` and `testimonialStyles` arrays from `app/page.tsx`.
            - **Refactored Sample Questions Panel Background:**
                - Introduced a new CSS variable `--sample-questions-background` in `app/globals.css`. It's set to `var(--card)` in `:root` (light) and `30 12% 12%` in `.dark`.
                - Removed the old `--hero-dark-background` variable from `app/globals.css`.
                - Updated `tailwind.config.ts` to remove the `hero-dark` color and add `sample-questions` linked to the new CSS variable.
                - Changed the sample questions panel div in `app/page.tsx` to use the single class `bg-sample-questions` instead of separate light/dark classes (`bg-card dark:bg-hero-dark`).
    - **Updated Start Buttons (`app/page.tsx`):** Changed the main call-to-action "Start" buttons to use `bg-accent-orange` in both light and dark modes (previously `bg-primary` in light, `dark:bg-accent-orange` in dark).
    - **Simplified Summary Page (`app/summary/page.tsx`):** Removed the "Do 10 More" button and its corresponding handler (`handleMoreFlashcards`), leaving only the "Finish" button.
    - **Fixed AI Route Scope:** Addressed a code review comment in `app/api/ai/route.ts` by adding block scopes (`{}`) to `case` statements to prevent lexical declaration scope issues.

## Next Steps

- Visually verify the application's appearance in **both light and dark modes** (especially the landing page `app/page.tsx`) to ensure the new themes and recent styling changes (including the Start buttons) are applied correctly and look as intended.
- Thoroughly test the updated PDF upload flow and the flashcard study flow (including batch continuation, counter, and loading states).
- Consider adding more granular progress updates for PDF extraction if feasible.
- Review overall error handling and user feedback for clarity across all implemented features.
