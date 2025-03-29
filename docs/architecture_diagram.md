# AI Flashcard Generator: Architecture Diagram

This document provides a detailed visual representation of the application's architecture using Mermaid diagrams.

## System Architecture

```mermaid
graph TD
    subgraph "Client Browser"
        UI[React UI Components]
        Storage[Session Storage]
        Interactions[User Interactions]
    end

    subgraph "Next.js API Routes"
        AIRoute["/api/ai Route Handler"]
        Middleware[Middleware Layer (AI)]
        Controllers[Controller Layer (AI)]
        Services[Service Layer (AI)]
        Prompts[Prompt Templates (AI)]
        PdfExtractRoute["/api/pdf-extract (POST)"]
        PdfStatusRoute["/api/pdf-extract/status/[jobId] (GET)"]
    end

    subgraph "External Services"
        AI[OpenAI/Mistral API]
        Redis[(Redis / Upstash)]
    end

    UI --> |Upload/Interact| AIRoute
    UI --> |PDF Upload| PdfExtractRoute
    UI --> |Poll Status| PdfStatusRoute

    PdfExtractRoute --> |Store Job Status| Redis
    PdfExtractRoute --> |Use pdf-parse| PdfExtractRoute
    PdfStatusRoute --> |Read Job Status| Redis
    Redis --> |Return Status| PdfStatusRoute

    AIRoute --> |Validate| Middleware
    Middleware --> |Route Request| Controllers
    Controllers --> |Process| Services
    Services --> |Use Templates| Prompts
    Services --> |Make Request| AI
    AI --> |Response| Services
    Services --> |Parse Response| Controllers
    Controllers --> |Format Response| AIRoute
    AIRoute --> |JSON Response| UI

    PdfStatusRoute --> |Return Text/Status| UI
    UI --> |Store Data| Storage
    Storage --> |Retrieve Data| UI
    Interactions --> |Trigger Actions| UI
```

## User Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant PdfExtractAPI as /api/pdf-extract
    participant PdfStatusAPI as /api/pdf-extract/status/:jobId
    participant Redis
    participant ProcessingPage
    participant ResultsPage
    participant StudyMode
    participant SummaryPage
    participant AI_API as /api/ai
    participant CourseOverviewPage

    User->>HomePage: Upload Transcript (TXT/DOCX/PDF)

    alt TXT/DOCX Upload
        HomePage->>HomePage: Extract Text & Validate
        HomePage->>HomePage: Store Text in sessionStorage
        HomePage->>ProcessingPage: Navigate with Text
    else PDF Upload
        HomePage->>PdfExtractAPI: POST PDF File
        PdfExtractAPI->>Redis: Store Initial Job Status
        PdfExtractAPI-->>HomePage: Return Job ID
        loop Poll Status
            HomePage->>PdfStatusAPI: GET Status (using Job ID)
            PdfStatusAPI->>Redis: Read Job Status
            Redis-->>PdfStatusAPI: Return Status/Progress/Result
            PdfStatusAPI-->>HomePage: Return Status/Progress/Result
            alt Status is 'processing'
                HomePage->>User: Update Progress UI
            else Status is 'completed'
                HomePage->>HomePage: Validate Word Count
                HomePage->>HomePage: Store Text in sessionStorage
                HomePage->>ProcessingPage: Navigate with Text
            else Status is 'failed'
                HomePage->>User: Show Error
            end
        end
    end

    ProcessingPage->>AI_API: Request Analysis (type: "analyze")
    AI_API->>AI_API: Apply Rate Limiting, Validate, Process
    AI_API-->>ProcessingPage: Return Subject & Outline
    ProcessingPage->>ResultsPage: Redirect with Course Data
    ResultsPage->>User: Display Subject & Outline
    User->>ResultsPage: Select Study Mode
    ResultsPage->>StudyMode: Redirect to Selected Mode

    alt Flashcard Mode
        StudyMode->>AI_API: Request Flashcards (type: "generate-batch")
        AI_API-->>StudyMode: Return Flashcards
        User->>StudyMode: Interact with Flashcards
        StudyMode->>AI_API: Request More Flashcards as Needed
        User->>StudyMode: Click "Stop"
        StudyMode->>SummaryPage: Redirect with Session Data (Flashcard Summary)
    else MCQ Mode
        StudyMode->>AI_API: Request MCQs (type: "generate-mcq-batch")
        AI_API-->>StudyMode: Return MCQs
        User->>StudyMode: Answer Questions
        StudyMode->>AI_API: Request More MCQs as Needed
        User->>StudyMode: Click "Stop"
        StudyMode->>SummaryPage: Redirect with Session Data (MCQ Summary)
    end

    SummaryPage->>User: Display Session Summary
    alt Flashcard Summary
        User->>SummaryPage: Click "Finish"
        SummaryPage->>CourseOverviewPage: Redirect
    else MCQ Summary
        User->>SummaryPage: Click "Start New"
        SummaryPage->>HomePage: Redirect
    end

```

## API Request Flow

```mermaid
flowchart TD
    A[Client Request] --> B{Rate Limit Check}
    B -->|Limit Exceeded| C[Return 429 Error]
    B -->|Limit OK| D{Request Validation}
    D -->|Invalid| E[Return 400 Error]
    D -->|Valid| F{Operation Type}
    
    F -->|analyze| G[Handle Analyze]
    F -->|generate-batch| H[Handle Generate Batch]
    F -->|generate-mcq-batch| I[Handle Generate MCQ Batch]
    
    G --> J[AI Service: analyzeTranscript]
    H --> K[AI Service: generateFlashcards]
    I --> L[AI Service: generateMCQs]
    
    J --> M[Parse Response]
    K --> M
    L --> M
    
    M -->|Success| N[Return JSON Response]
    M -->|Error| O[Return Error Response]
```

## Component Structure

```mermaid
classDiagram
    class RouteHandler {
        +POST(request)
    }
    
    class Middleware {
        +getClientIP(headers)
        +isValidIP(ip)
        +validateRequestBody(body)
        +applyRateLimit(ip)
    }
    
    class Controllers {
        +handleAnalyze(body, ip)
        +handleGenerateBatch(body, ip)
        +handleGenerateMCQBatch(body, ip)
    }
    
    class Services {
        +analyzeTranscript(params)
        +generateFlashcards(params)
        +generateMCQs(params)
        +cleanAIResponse(text)
    }
    
    class Prompts {
        +analyze(transcript, language)
        +generateBatch(courseData, transcript, count, language)
        +generateMCQBatch(courseData, transcript, count, language)
    }
    
    class Logging {
        +logApiRequest(type, ip, status, error)
    }

    RouteHandler --> Middleware : uses
    RouteHandler --> Controllers : routes to
    Controllers --> Services : calls
    Services --> Prompts : uses templates
    RouteHandler --> Logging : logs requests
    Controllers --> Logging : logs operations
    %% PdfProcessor removed as it's no longer used %%
```

## Note on Viewing Mermaid Diagrams

These diagrams are written in Mermaid syntax. To view them:

1. Use a Markdown editor that supports Mermaid (like VS Code with the Markdown Preview Mermaid Support extension)
2. Copy the diagram code to an online Mermaid editor like [Mermaid Live Editor](https://mermaid.live/)
3. Or view this document in GitHub, which natively supports Mermaid diagrams
