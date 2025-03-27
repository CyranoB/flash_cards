# Project Brief: AI Study Companion (Flash Cards App)

## 1. Project Goal

To create a web application that helps students study more effectively by transforming their course materials (transcripts, documents) into interactive study tools like flashcards and multiple-choice questions (MCQs) using AI.

## 2. Core Requirements

-   **Document Upload:** Allow users to upload course materials in various formats (initially .txt, .docx, .pdf).
-   **AI Processing:** Use AI (specifically OpenAI models) to analyze the uploaded content and generate relevant study materials (flashcards, MCQs).
-   **Study Modes:** Provide interfaces for users to study the generated materials (flashcard viewer, MCQ quiz interface).
-   **User Interface:** Offer a clean, intuitive, and responsive user interface.
-   **Configuration:** Allow users to configure AI settings (API key, model).
-   **Internationalization:** Support multiple languages (initially English and French).

## 3. Target Audience

Students seeking more efficient ways to study and review course material.

## 4. Key Technologies (Initial)

-   **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
-   **Backend:** Next.js API Routes
-   **AI:** OpenAI API (via `@ai-sdk/openai`)
-   **Document Processing:** `mammoth` (for .docx), `pdf-text-extract` (for .pdf)
-   **State Management/Job Queuing:** Redis (via `@upstash/redis`) for background PDF processing status.
-   **Authentication:** Clerk

## 5. Scope Considerations

-   Initial focus on flashcards and MCQs.
-   Support for .txt, .docx, and .pdf uploads.
-   Configurable file size limits (default 25MB).
-   Background processing for potentially long PDF text extraction.
