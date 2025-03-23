/**
 * AI prompt templates for different operations
 */

export const prompts = {
  analyze: (transcript: string, language: string) => {
    const languageInstructions = language === "en" ? "Respond in English." : "Répondez en français."
    return `
      You are an educational assistant helping university students study.
      Analyze the following course transcript and:
      1. Determine the main subject of the course
      2. Create a concise outline with 3-5 key points
      
      Transcript:
      ${transcript}
      
      ${languageInstructions}
      
      IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
      The JSON must have this exact structure:
      {"subject": "The main subject of the course", "outline": ["Key point 1", "Key point 2", "Key point 3"]}
    `
  },
  
  generateBatch: (courseData: { subject: string, outline: string[] }, transcript: string, count: number, language: string) => {
    const languageInstructions = language === "en" ? "Create the flashcards in English." : "Créez les fiches en français."
    return `
      You are an educational assistant helping university students study.
      Based on the following course information and transcript, create ${count} flashcards with questions and answers.
      
      Course Subject: ${courseData.subject}
      Course Outline: ${courseData.outline.join(", ")}
      
      Original Transcript:
      ${transcript}
      
      IMPORTANT INSTRUCTIONS:
      1. Use the actual content from the transcript to create questions, not just the subject and outline
      2. Vary the question types between:
         - Definitions (What is...?)
         - Comparisons (How does X compare to Y?)
         - Applications (How would you use...?)
         - Analysis (Why does...?)
         - Cause and Effect (What happens when...?)
         - Examples (Give an example of...)
      
      2. Use different question formats:
         - Open-ended questions
         - Fill-in-the-blank statements
         - True/False with explanation
         - "Identify the concept" questions
         - Multiple choice questions
         
      3. Vary the cognitive depth:
         - Basic recall (remembering facts)
         - Understanding (explaining concepts)
         - Application (using knowledge in new situations)
         - Analysis (breaking down complex ideas)
      
      4. Make questions:
         - Based on specific details from the transcript
         - Challenging but clear
         - Focused on key concepts
         - Engaging and thought-provoking
         - Different from each other
      
      ${languageInstructions}
      
      IMPORTANT: Respond ONLY with a valid JSON object and nothing else. No markdown formatting, no backticks, no explanation text.
      The JSON must have this exact structure:
      {"flashcards": [
        {"question": "Question 1", "answer": "Answer 1"},
        {"question": "Question 2", "answer": "Answer 2"},
        ... and so on for all ${count} flashcards
      ]}
    `
  },
  
  generateMCQBatch: (courseData: { subject: string, outline: string[] }, transcript: string, count: number, language: string) => {
    const languageInstructions = language === "en" 
      ? "Create the questions in English." 
      : "Créez les questions en français."
    
    return `
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
      
      CRITICAL: Reply ONLY with a valid JSON object. No explanations, no markdown formatting, no code block markers.
      
      Use this simplified JSON format:
      
      {"questions": [
        {
          "question": "What is the primary function of mitochondria in a cell?",
          "A": "Protein synthesis",
          "B": "Energy production",
          "C": "Cell division",
          "D": "Waste elimination",
          "correct": "B"
        },
        {
          "question": "Which programming paradigm treats computation as the evaluation of mathematical functions?",
          "A": "Procedural programming",
          "B": "Object-oriented programming",
          "C": "Functional programming",
          "D": "Event-driven programming",
          "correct": "C"
        }
      ]}
      
      Now create ${count} questions in this exact format based on the transcript provided.
    `
  }
}
