# MCQ Feature Implementation Plan

## Overview

This document outlines the implementation plan for adding a Multiple Choice Question (MCQ) feature to our existing AI Flashcard Generator application. The feature will allow users to choose between studying with traditional flashcards or testing their knowledge with multiple choice questions generated from their course transcripts.

## Current Application Flow

Our application currently follows this linear flow:
1. **Upload**: User uploads a transcript document
2. **Processing**: AI analyzes the transcript
3. **Results**: User sees course subject and outline
4. **Flashcards**: User studies using AI-generated flashcards
5. **Summary**: User reviews all studied flashcards

## Target Application Flow

After implementation, the flow will include a choice after the Results page:
1. **Upload**: User uploads a transcript document
2. **Processing**: AI analyzes the transcript
3. **Results**: User sees course subject and outline
4. **Study Mode Selection**: User chooses between Flashcards or MCQs
5. **Flashcards/MCQs**: User studies using the selected mode
6. **Summary**: User reviews session (specific to the chosen mode)

## Implementation Tasks

### Phase 1: Study Mode Selection (2 days)

1. **Modify Results Page**
   - Update `/app/results/page.tsx` to include a mode selection UI
   - Create two buttons: "Flashcards" and "Multiple Choice"
   - Update translations in `/lib/translations.ts` for both languages
   - Modify the "I'm Ready" button to become a mode selection container

   ```tsx
   // Example code for mode selection
   
      router.push("/flashcards")}>
       {t.flashcardsMode}
     
      router.push("/mcq")}>
       {t.mcqMode}
     
   
   ```

2. **Update Translation Files**
   - Add new translation keys for MCQ-related UI elements
   - Include descriptions for both study modes to help users understand the difference

### Phase 2: MCQ Page Creation (3 days)

1. **Create MCQ Page**
   - Create `/app/mcq/page.tsx` with a structure similar to the flashcards page
   - Implement a UI that displays:
     - Question text
     - 4 answer choices (A, B, C, D) using radio buttons
     - Navigation controls (Submit/Next)
     - Progress indicator
   
   ```tsx
   // Key components for MCQ page
   "use client"
   import { useState, useEffect, useCallback } from "react"
   import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
   import { Button } from "@/components/ui/button"
   import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
   // Additional imports...
   
   export default function McqPage() {
     // State management for MCQs, user selections, and scoring
     const [questions, setQuestions] = useState([])
     const [currentIndex, setCurrentIndex] = useState(0)
     const [selectedAnswer, setSelectedAnswer] = useState("")
     const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
     const [score, setScore] = useState(0)
     const [answeredQuestions, setAnsweredQuestions] = useState([])
     // Additional state and hooks...
     
     // Component logic
   }
   ```

2. **Create MCQ Summary Page**
   - Create `/app/mcq-summary/page.tsx` to display session results
   - Show overall score (correct/total)
   - List all questions with user's answers and correct answers
   - Highlight incorrect answers
   - Add "Finish" button to return to home page

### Phase 3: API Integration (3 days)

1. **Extend AI API for MCQ Generation**
   - Modify `/app/api/ai/route.ts` to add a new operation type: "generate-mcq-batch"
   - Create a prompt template for generating multiple choice questions
   - Implement response parsing for MCQ format

   ```typescript
   // Example prompt addition to route.ts
   else if (type === "generate-mcq-batch") {
     const { courseData, transcript, count = 10 } = body
     const languageInstructions = language === "en" 
       ? "Create the questions in English." 
       : "Créez les questions en français."
     
     const prompt = `
       You are an educational assistant helping university students study.
       Based on the following course information and transcript, create ${count} multiple choice questions.
       
       Course Subject: ${courseData.subject}
       Course Outline: ${courseData.outline.join(", ")}
       
       Original Transcript:
       ${transcript}
       
       IMPORTANT INSTRUCTIONS:
       1. Each question must have exactly 4 options (A, B, C, D)
       2. Exactly one option must be correct
       3. The other 3 options must be plausible but incorrect
       4. Use actual content from the transcript
       5. Vary question difficulty and cognitive levels
       
       ${languageInstructions}
       
       Respond ONLY with a valid JSON object with this structure:
       {"questions": [
         {
           "question": "Question text",
           "options": [
             {"id": "A", "text": "Option A text", "correct": true|false},
             {"id": "B", "text": "Option B text", "correct": true|false},
             {"id": "C", "text": "Option C text", "correct": true|false},
             {"id": "D", "text": "Option D text", "correct": true|false}
           ]
         },
         // More questions...
       ]}
     `
     
     // Process response and return results
   }
   ```

2. **Create MCQ Integration Library**
   - Add functions to `/lib/ai.ts` for generating and managing MCQs
   - Implement `generateMcqQuestions()` function
   - Add validation to ensure exactly one correct answer per question

### Phase 4: Data Management (2 days)

1. **Implement Session Storage for MCQs**
   - Create storage mechanism for MCQ data in sessionStorage
   - Store user selections, correct answers, and score
   - Implement functions to track user performance

   ```typescript
   // Example structure for MCQ data in session storage
   interface McqOption {
     id: string;
     text: string;
     correct: boolean;
   }
   
   interface McqQuestion {
     question: string;
     options: McqOption[];
     userSelection?: string;
     isCorrect?: boolean;
   }
   
   // Store in sessionStorage as "mcqQuestions"
   ```

2. **Implement Score Calculation**
   - Add logic to calculate and update score as user progresses
   - Track correctly answered questions for the summary page

### Phase 5: UI Components & Styling (2 days)

1. **Create MCQ Components**
   - Build radio button group for answer selection
   - Implement feedback UI for correct/incorrect answers
   - Create progress indicator for MCQ session

2. **Style MCQ Interface**
   - Ensure consistent styling with existing application
   - Add visual feedback for selected answers and correct/incorrect answers
   - Style the summary page with clear indication of performance

### Phase 6: Testing & Refinement (3 days)

1. **Test MCQ Generation**
   - Verify AI generates appropriate questions with valid options
   - Test for variety in question types and difficulty

2. **Test User Flow**
   - Verify navigation between pages works correctly
   - Test score calculation and summary display
   - Ensure session data is properly managed

3. **Test Language Support**
   - Verify MCQs are generated in both English and French
   - Check UI translations for all MCQ-related elements

4. **Performance Testing**
   - Test with various transcript lengths
   - Ensure MCQ generation does not cause timeouts

### Phase 7: Integration & Deployment (1 day)

1. **Final Integration**
   - Ensure consistent error handling
   - Update README with new feature information
   - Document the MCQ feature

2. **Deployment**
   - Deploy to staging for final testing
   - Deploy to production

## Code Structure

```
/app
  /results
    page.tsx (modified to include mode selection)
  /mcq
    page.tsx (new - MCQ interface)
  /mcq-summary
    page.tsx (new - MCQ results)
/lib
  /ai.ts (extended with MCQ generation)
  /translations.ts (updated with MCQ-related strings)
/components
  /ui
    /radio-group.tsx (for MCQ options)
/types
  (extended with MCQ-related interfaces)
```

## UI Mockups

For the MCQ page, we'll follow the existing card-based design:

1. **Study Mode Selection on Results Page**
   - Two equal-sized buttons: "Flashcards" and "Multiple Choice"
   - Brief description of each mode beneath the buttons

2. **MCQ Question Interface**
   - Card with question text at top
   - Four radio buttons for answer options
   - "Submit Answer" button (changes to "Next Question" after submission)
   - Progress indicator showing current question number

3. **MCQ Summary Page**
   - Overall score prominently displayed
   - List of all questions with correct/incorrect indicators
   - Each question shows the selected answer and correct answer
   - "Finish" button at bottom

## Timeline

- Phase 1: Study Mode Selection - 2 days
- Phase 2: MCQ Page Creation - 3 days
- Phase 3: API Integration - 3 days
- Phase 4: Data Management - 2 days
- Phase 5: UI Components & Styling - 2 days
- Phase 6: Testing & Refinement - 3 days
- Phase 7: Integration & Deployment - 1 day

**Total Estimated Time**: 16 days

## Success Criteria

The MCQ feature implementation will be considered successful when:

1. Users can choose between flashcards and MCQs after viewing course results
2. MCQs are correctly generated with appropriate answer options
3. User selections are properly tracked and scored
4. The MCQ summary accurately displays performance and highlights incorrect answers
5. The feature works in both English and French
6. The UI is consistent with the existing application design

This implementation plan provides a comprehensive roadmap for adding the Multiple Choice Question feature to our existing AI Flashcard Generator application while maintaining consistency with the current user experience and technical architecture.