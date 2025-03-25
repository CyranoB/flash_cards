# AI Flashcard Generator: System Overview

## Quick Reference

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 15 (App Router) | Modern, responsive UI with server-side rendering |
| Styling | Tailwind CSS + shadcn | Clean, accessible design with utility-first approach |
| PDF Processing | Web Workers | Non-blocking PDF text extraction with progress tracking |
| AI Integration | OpenAI/Mistral API | Transcript analysis and content generation |
| Data Storage | Client-side sessionStorage | Temporary session data without server persistence |
| Architecture | Serverless | Scalable, cost-effective processing on demand |

## User Journey Map

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌───────────────────┐
│  Home Page  │     │ Processing  │     │   Results   │     │   Study Mode      │
│  (Upload)   │────▶│    Page     │────▶│    Page     │────▶│ Flashcards or MCQ │
└─────────────┘     └─────────────┘     └─────────────┘     └───────────────────┘
      │                    │                                          │
      │                    │                                          │
      ▼                    ▼                                          ▼
┌─────────────┐     ┌─────────────┐                          ┌─────────────┐
│ File Upload │     │ AI Analysis │                          │   Summary   │
│ Processing  │     │ API Request │                          │    Page     │
└─────────────┘     └─────────────┘                          └─────────────┘
```

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ React UI    │  │ Session     │  │ User Interactions   │  │
│  │ Components  │  │ Storage     │  │ (Next, Prev, Toggle)│  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ PDF Web Worker (Non-blocking text extraction)       │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Middleware  │  │ Controllers │  │ Service Layer       │  │
│  │ Rate Limit  │  │ Operation   │  │ AI Integration      │  │
│  │ Validation  │  │ Handlers    │  │ Response Processing │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      External AI Service                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ OpenAI/Mistral API (GPT-4o-Mini or similar model)   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Key Workflows

### 1. Transcript Analysis

1. User uploads transcript file
2. For PDF files, Web Worker extracts text with progress tracking
3. Client extracts text and stores in sessionStorage
4. Request sent to `/api/ai` with `type: "analyze"`
5. Middleware validates request and applies rate limiting
6. Controller routes to appropriate handler
7. AI service generates subject and outline
8. Response returned to client and displayed on Results page

### 2. Flashcard Generation

1. User selects "Flashcards" mode
2. Request sent to `/api/ai` with `type: "generate-batch"`
3. Controller extracts parameters and calls service
4. AI service generates batch of flashcards
5. Response returned to client for interactive study
6. Additional batches generated as needed

### 3. MCQ Generation

1. User selects "Multiple Choice" mode
2. Request sent to `/api/ai` with `type: "generate-mcq-batch"`
3. Controller processes request and calls service
4. AI service generates questions with answer options
5. Response returned to client for interactive quiz
6. User performance tracked for summary

## Documentation Index

For detailed information, refer to these documents:

- [Application Flow](./app_flow_document.md) - Detailed user journey and page transitions
- [API Architecture](./API_ARCHITECTURE.md) - API structure and implementation details
- [Backend Structure](./backend_structure_document.md) - Server-side implementation
- [Frontend Guidelines](./frontend_guidelines_document.md) - UI/UX principles and implementation
- [Tech Stack](./tech_stack_document.md) - Technology choices and rationale
