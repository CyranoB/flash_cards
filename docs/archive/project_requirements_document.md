# Project Requirements Document

## 1. Project Overview

This project is a modern flashcard website designed specifically for university students. Its main feature is the automatic analysis of uploaded course transcripts using the OpenAI GPT-4o-Mini model, which generates detailed course subjects and outlines. The website is built to assist students in studying efficiently by uploading course materials in plain text format. The system processes the transcript to create a course subject overview and outline without manual intervention by the student.

The purpose of the website is to help students study more effectively by eliminating the need to manually create study guides. Key objectives include providing an intuitive upload interface, efficient AI processing to extract course subjects and outlines, and a streamlined flashcard navigation process. Success will be measured by ease of use, accurate analysis of course materials, and a quick, responsive, modern design that supports both English and French languages.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   A home/upload screen enabling students to drag and drop or upload one plain text transcript file (max 50 words total per file).
*   Configuration for storing the OpenAI API key, model (default: gpt-4o-mini), and OpenAI base URL.
*   AI-powered analysis that comprehensively reads the transcript to determine the course subject and generate a concise outline.
*   Display screen showing the detected subjects and outlines with a “Ready!” button for proceeding.
*   Minimal flashcard interface allowing users to navigate with "next" and "stop" options.
*   Session summary generation upon stopping, followed by an automatic reset to the home screen.
*   Visual feedback elements like loading indicators and progress bars at every AI processing step.
*   Multilingual support for English and French interface content.

**Out-of-Scope:**

*   User authentication, protected login, or long-term user data storage.
*   Handling file types other than plain text.
*   Flashcard customization based on additional user inputs.
*   Caching, data retention, or personalization beyond the immediate session.
*   Accessibility features beyond basic usability.
*   Handling transcripts larger than the specified limit.

## 3. User Flow

Visitors are welcomed by a clean, modern homepage designed for simple transcript uploads. Users can drag and drop files or use a file selector for plain text format uploads. Once submitted, the system processes the files with visual feedback like loading indicators.

After processing, a display screen shows the detected course subject and outline. Users click the “Ready!” button to enter a flashcard interface. Flashcards are navigated via “next” for additional cards or “stop” for session conclusion. Upon stopping, a session summary is provided before returning to the home page.

## 4. Core Features

*   **Transcript Upload and Processing:**

    *   Support for single plain text file uploads (up to 50 words).
    *   Configurable system for OpenAI integration.

*   **AI-Powered Course Analysis:**

    *   AI comprehensively analyzes transcripts to determine course subjects and outlines.

*   **Flashcard Navigation:**

    *   Interfaces facilitate navigation through flashcards with "next" and "stop" options.
    *   Provides a session summary followed by a reset to the home/upload screen.

*   **Visual Feedback and Modern Design:**

    *   Real-time feedback with loading indicators during AI processing.
    *   Utilizes Next.js, Tailwind CSS, and shadcn components for a contemporary UI.

*   **Multilingual Support:**

    *   Interface and content available in both English and French.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Next.js 15 with TypeScript for a modern web interface.
    *   Tailwind CSS for styling with a contemporary aesthetic.
    *   shadcn component library for stylish UI components.

*   **Backend:**

    *   Serverless architecture.
    *   Temporary data handling for each session.

*   **AI Integration:**

    *   OpenAI GPT-4o-Mini for transcript analysis.

*   **Additional Tools:**

    *   Integrated development environments like VS Code, Cursor, and others for efficient programming.
    *   Use of V0 by Vercel and Bolt for project scaffolding.

## 6. Non-Functional Requirements

*   **Performance:**

    *   Fast load times and responsive interactions.
    *   Efficient transcript processing with real-time feedback.

*   **Security:**

    *   Data handled transiently without permanent storage.

*   **Scalability:**

    *   Serverless architecture scales with demand.

*   **Usability:**

    *   Simple, intuitive interface with clear navigation and visual cues.

*   **Reliability:**

    *   Consistent performance across browsers and devices with minimal AI processing delays.

## 7. Constraints & Assumptions

*   Plain text transcript uploads only with a 50-word file limit.
*   Reliance on OpenAI GPT-4o-Mini for natural language processing.
*   Assumes a reliable network connection for serverless processing.
*   Multilingual support covers both English and French.

## 8. Known Issues & Potential Pitfalls

*   The 50-word limit may require careful input management.
*   Serverless architecture may cause processing delays under high demand, addressed with visual feedback.
*   Challenges with AI model integration may require robust error handling.
*   Language support for mixed-language content needs thorough testing.
*   Lack of data persistence limits personalization, requiring clear user communication.

This PRD serves as a foundational document for the flashcard website project. Future technical documents (e.g., Tech Stack, Development Guidelines) should align with it to ensure clarity throughout development.
