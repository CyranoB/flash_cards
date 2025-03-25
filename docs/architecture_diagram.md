# AI Flashcard Generator: Architecture Diagram

This document provides a detailed visual representation of the application's architecture using Mermaid diagrams.

## System Architecture

```mermaid
graph TD
    subgraph "Client Browser"
        UI[React UI Components]
        Storage[Session Storage]
        Interactions[User Interactions]
        PDFWorker[PDF Web Worker]
    end

    subgraph "Next.js API Routes"
        Route["/api/ai Route Handler"]
        Middleware[Middleware Layer]
        Controllers[Controller Layer]
        Services[Service Layer]
        Prompts[Prompt Templates]
    end

    subgraph "External Services"
        AI[OpenAI/Mistral API]
    end

    UI --> |Upload/Interact| Route
    UI --> |PDF Upload| PDFWorker
    PDFWorker --> |Extracted Text| UI
    Route --> |Validate| Middleware
    Middleware --> |Route Request| Controllers
    Controllers --> |Process| Services
    Services --> |Use Templates| Prompts
    Services --> |Make Request| AI
    AI --> |Response| Services
    Services --> |Parse Response| Controllers
    Controllers --> |Format Response| Route
    Route --> |JSON Response| UI
    UI --> |Store Data| Storage
    Storage --> |Retrieve Data| UI
    Interactions --> |Trigger Actions| UI
```

## User Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant ProcessingPage
    participant ResultsPage
    participant StudyMode
    participant SummaryPage
    participant API as /api/ai

    User->>HomePage: Upload Transcript
    HomePage->>ProcessingPage: Redirect with Transcript
    ProcessingPage->>API: Request Analysis (type: "analyze")
    API->>API: Apply Rate Limiting
    API->>API: Validate Request
    API->>API: Generate AI Prompt
    API->>API: Process AI Response
    API-->>ProcessingPage: Return Subject & Outline
    ProcessingPage->>ResultsPage: Redirect with Course Data
    ResultsPage->>User: Display Subject & Outline
    User->>ResultsPage: Select Study Mode
    ResultsPage->>StudyMode: Redirect to Selected Mode
    
    alt Flashcard Mode
        StudyMode->>API: Request Flashcards (type: "generate-batch")
        API-->>StudyMode: Return Flashcards
        User->>StudyMode: Interact with Flashcards
        StudyMode->>API: Request More Flashcards as Needed
        User->>StudyMode: Click "Stop"
        StudyMode->>SummaryPage: Redirect with Session Data
    else MCQ Mode
        StudyMode->>API: Request MCQs (type: "generate-mcq-batch")
        API-->>StudyMode: Return MCQs
        User->>StudyMode: Answer Questions
        StudyMode->>API: Request More MCQs as Needed
        User->>StudyMode: Click "Stop"
        StudyMode->>SummaryPage: Redirect with Session Data
    end
    
    SummaryPage->>User: Display Session Summary
    User->>SummaryPage: Click "Finish"
    SummaryPage->>HomePage: Redirect to Start New Session
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
    
    class PdfProcessor {
        +extractText(file)
        +handleTimeout()
        +trackProgress()
        +handleErrors()
    }
    
    RouteHandler --> Middleware : uses
    RouteHandler --> Controllers : routes to
    Controllers --> Services : calls
    Services --> Prompts : uses templates
    RouteHandler --> Logging : logs requests
    Controllers --> Logging : logs operations
    PdfProcessor --> Logging : logs extraction
```

## Note on Viewing Mermaid Diagrams

These diagrams are written in Mermaid syntax. To view them:

1. Use a Markdown editor that supports Mermaid (like VS Code with the Markdown Preview Mermaid Support extension)
2. Copy the diagram code to an online Mermaid editor like [Mermaid Live Editor](https://mermaid.live/)
3. Or view this document in GitHub, which natively supports Mermaid diagrams
