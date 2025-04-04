# Frontend Guideline Document

> **Key Points**
> - Next.js 15 with App Router architecture for modern, responsive UI
> - Tailwind CSS with shadcn components for consistent, accessible styling
> - Focus on usability, accessibility, and responsive design
> - Modern, minimalistic aesthetic with high-contrast color schemes
> - Performance optimizations for smooth user experience

This document provides a clear overview of how the frontend of our flashcard website is built, the design principles behind it, and the technologies we use. It is intended to be easy to understand, even if you do not have a technical background.

## Frontend Architecture

Our website is built using Next.js (version 15) with TypeScript for strong type support and reliable development. We use Tailwind CSS for styling because it makes it easier to maintain consistent designs, and shadcn UI components to speed up development with pre-made, accessible UI components.

This architecture is designed to be scalable: as the site grows, adding new features or changing how pages work is straightforward due to the component-based structure. It is built to be maintainable, so our code is organized into logical pieces that can be easily understood by new developers. We also focus on performance, using modern techniques like server-side rendering and static generation where appropriate.

## Design Principles

We follow several design principles to ensure the website is as user-friendly as possible:

*   **Usability:** The site is simple to use with intuitive uploading of transcripts, clear navigation between flashcards, and easy-to-read summaries.
*   **Accessibility:** Our design ensures that users of all abilities can interact with the website. This means clear text, accessible buttons, and thoughtful color contrasts.
*   **Responsiveness:** The website automatically adjusts the layout to work well on both desktop and mobile devices.
*   **Modern Aesthetic:** The visual layout is clean and minimalistic, aligning with current design trends which help students concentrate on the content.

## Styling and Theming

For styling, we use Tailwind CSS, which allows us to quickly apply styles directly in our code while following modern CSS practices. Our UI components from shadcn are designed with accessibility and ease of use in mind.

### Design Style

*   **Style:** Modern and minimalistic. We use elements of flat design with a touch of modern material influence to keep the interface clean and engaging.

### Color Palette

The application uses a theme defined in `app/globals.css` and configured in `tailwind.config.ts`. The current theme aims for a warm, focused, and modern feel:

*   **Light Mode:**
    *   **Primary:** Muted Green (`hsl(140, 40%, 40%)`) - Used for key actions, highlights.
    *   **Secondary:** Warm Off-White (`hsl(50, 20%, 94%)`) - Used for subtle backgrounds, borders.
    *   **Background/Card:** Very Light Beige/Cream (`hsl(50, 25%, 97%)`) - Main background and card surfaces.
    *   **Accent:** Orange (`hsl(30, 80%, 60%)`) - Used for specific highlights like badges and call-to-action buttons.
    *   **Text:** Dark Gray/Near Black.
*   **Dark Mode:**
    *   **Primary:** Light Gray (`hsl(240, 5%, 85%)`) - Used for text and some highlights.
    *   **Secondary/Card:** Dark Gray (`hsl(240, 5%, 15%)`) - Used for card backgrounds.
    *   **Background:** Very Dark Gray (`hsl(240, 5%, 10%)`) - Main background.
    *   **Accent:** Orange (`hsl(30, 80%, 60%)`) - Used for call-to-action buttons and focus rings.
    *   **Text:** Light Gray/Near White.

This palette provides good contrast and a calm, academic feel suitable for a study tool. Colors are primarily applied using Tailwind utility classes linked to CSS variables (e.g., `bg-primary`, `text-secondary-foreground`, `bg-card`).

### Fonts

We use a clean and modern sans-serif font (such as Inter or similar) to ensure text is legible and fits the overall design aesthetic.

## Component Structure

The frontend is built with a component-based approach. This means the interface is divided into small, reusable pieces. For example:

*   **File Upload Component:** Manages the drag-and-drop upload and file selection functions.
*   **Flashcard Component:** Handles the display and navigation of flashcards.
*   **Session Summary Component:** Shows a summary when a session ends.
*   **Error Dialog Component:** Provides clear feedback when uploads exceed size limits or other validation errors occur.

Organizing the code this way improves maintainability. If we need to update the flashcard style or add new behavior, we can modify the related component without affecting the rest of the website.

## User Input Validation

The frontend implements several validation mechanisms to ensure a smooth user experience:

### File Upload Validation

* **File Size Limits**: The upload component validates files against the configurable maximum file size (default: 25MB, configurable via `NEXT_PUBLIC_MAX_FILE_SIZE_MB` environment variable)
* **File Type Validation**: Only accepts PDF, TXT, and DOCX file formats
* **Visual Feedback**: Provides clear error messages when files exceed size limits or have unsupported formats

### Transcript Validation

* **Word Count Limits**: The system validates transcripts against minimum (default: 500) and maximum (default: 50,000) word count limits
* **Feedback Mechanism**: Shows toast notifications with clear explanations when validation fails
* **Progressive Disclosure**: Informs users about size limitations before they attempt uploads

These validation mechanisms help prevent server errors and provide a better user experience by giving immediate feedback about potential issues.

## State Management

State management is the approach we use to handle data that changes over time – like the uploaded files, AI-generated outlines, and flashcard session details. We use React’s built-in state management through hooks like useState and useContext. This allows the state to be shared across various components, ensuring a smooth and consistent user experience.

## Routing and Navigation

We rely on Next.js’s built-in routing system, which creates routes automatically based on the files in our project folder. This makes it easy for users to navigate through different parts of the application:

*   The home/upload page for transcript uploads.
*   A subject and outline display page after AI analysis.
*   The flashcard interface for reviewing cards.
*   A session summary page that appears when the session is ended.

Using this organized routing system ensures that users can smoothly move from one section to another with clear pathways and consistent navigation tools.

## Performance Optimization

To ensure the website is fast and responsive, we have put several performance strategies in place:

*   **Lazy Loading:** Components and images load only when needed, reducing initial load times.
*   **Code Splitting:** The website divides code into smaller chunks, which are loaded only as necessary.
*   **Asset Optimization:** We optimize images, fonts, and other assets so that the website loads quickly even on slower networks.

These optimizations help maintain a smooth experience, especially important when processing uploads and AI analysis, where delays can otherwise impact user experience.

## Testing and Quality Assurance

Keeping our code reliable and error-free is a priority, so we use several testing strategies:

*   **Unit Tests:** Test individual components to make sure they work on their own.
*   **Integration Tests:** Ensure that different parts of the website interact correctly together, such as how file uploads work with the transcript analysis workflow.
*   **End-to-End Tests:** Simulate real user scenarios from start to finish, ensuring a complete session (upload to flashcard session summary) works as expected.

Tools used include popular testing frameworks like Jest and React Testing Library for unit and integration tests, as well as tools like Cypress for end-to-end testing.

## Conclusion and Overall Frontend Summary

In summary, our flashcard website is built with a clear focus on scalability, maintainability, and user experience. The key points include:

*   A modern and well-organized architecture using Next.js, TypeScript, and Tailwind CSS, supported by shadcn UI components for faster development.
*   A design that is simple, accessible, and responsive, ensuring a smooth experience whether a student is uploading course transcripts or reviewing generated flashcards.
*   Reusable components and structured state management that make the code easier to maintain and extend.
*   A robust routing system that organizes the site and guides users logically through the flashcard generation process.
*   Optimized performance strategies and thorough testing practices that guarantee a high-quality, responsive website.

These guidelines and technologies are carefully chosen to meet the project's goals and ensure that university students receive an intuitive, modern, and effective tool for learning through flashcards. Unique in its focus on automated flashcard generation and minimalistic design, this project is set up to provide a seamless learning experience while being easy to maintain and extend in the future.
