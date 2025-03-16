export const translations = {
  en: {
    // Upload page
    uploadTitle: "Upload Your Course Transcript",
    uploadDesc: "Drag and drop your transcript file here or click to browse",
    browseFiles: "Browse Files",
    change: "Change File",
    upload: "Process Transcript",
    uploading: "Processing...",
    fileReadyTitle: "File Ready",
    fileReadyDesc: "Your file has been loaded successfully. Click 'Process Transcript' to continue.",
    errorTitle: "Error",
    errorFileType: "Please upload a valid .txt or .docx file",
    errorWordCount: "File exceeds 50,000 words limit",
    errorProcessing: "Error processing file. Please try again.",
    noApiKey: "Please configure your OpenAI API key first",
    apiKeyMissing: "API Key Required",
    apiKeyMissingDesc: "Please configure your OpenAI API key to use the flashcard generator",
    configureApiKey: "Configure API Key",
    warningTitle: "Warning",
    noteTitle: "Note",
    contentLanguageNote: "Previously generated content will remain in its original language",
    noLanguageChangeProcessing: "Cannot change language during processing",

    // Configuration page
    configTitle: "AI Configuration",
    configDesc: "Configure your OpenAI API settings for the flashcard generator",
    apiKeyLabel: "OpenAI API Key",
    apiKeyRequired: "API key is required",
    modelLabel: "Model Name",
    modelRequired: "Model name is required",
    modelHint: "Enter the name of the OpenAI model you want to use (e.g., gpt-4o-mini, gpt-4o, gpt-3.5-turbo)",
    baseUrlLabel: "API Base URL",
    configSavedTitle: "Configuration Saved",
    configSavedDesc: "Your AI settings have been saved successfully",
    save: "Save Changes",
    cancel: "Cancel",

    // Processing page
    processingTitle: "Processing Transcript",
    processingDesc: "Please wait while we analyze your transcript",
    analyzing: "Analyzing transcript...",
    generating: "Generating...",
    complete: "Processing complete!",
    noTranscript: "No transcript found. Please upload a file first.",
    aiError: "Error processing with AI. Please try again.",

    // Results page
    resultsTitle: "Generated Flashcards",
    resultsDesc: "Review your AI-generated flashcards",
    cardCount: "Cards",
    flashcardError: "Error generating flashcard",
    subjectTitle: "Course Subject",
    outlineTitle: "Course Outline",
    readyButton: "Start Studying",

    // Flashcards page
    flashcardsTitle: "Study Flashcards",
    questionLabel: "Question",
    answerLabel: "Answer",
    showQuestion: "Show Question",
    showAnswer: "Show Answer",
    nextButton: "Next Card",
    stopButton: "End Session",
    loading: "Loading...",
    noResults: "No flashcards found. Please start over.",

    // Summary page
    summaryTitle: "Study Session Summary",
    summaryDesc: "Review your study session statistics",
    totalCards: "Total Cards",
    timeSpent: "Time Spent",
    accuracy: "Accuracy",
    startNew: "Start New Session",
    studiedCards: "Cards Studied",
    finishButton: "Finish & Start New Session",
    noFlashcards: "No flashcards found. Please start a new session.",

    // Settings
    settingsTitle: "Settings",
    settingsDesc: "Customize your flashcard experience",
    languageSettings: "Language Settings",
    themeSettings: "Theme Settings",
    configSettings: "Configuration Settings"
  },
  fr: {
    // Upload page
    uploadTitle: "Téléchargez Votre Transcription de Cours",
    uploadDesc: "Glissez-déposez votre fichier de transcription ici ou cliquez pour parcourir",
    browseFiles: "Parcourir les Fichiers",
    change: "Changer le Fichier",
    upload: "Traiter la Transcription",
    uploading: "Traitement en cours...",
    fileReadyTitle: "Fichier Prêt",
    fileReadyDesc: "Votre fichier a été chargé avec succès. Cliquez sur 'Traiter la Transcription' pour continuer.",
    errorTitle: "Erreur",
    errorFileType: "Veuillez télécharger un fichier .txt ou .docx valide",
    errorWordCount: "Le fichier dépasse la limite de 50 000 mots",
    errorProcessing: "Erreur lors du traitement du fichier. Veuillez réessayer.",
    noApiKey: "Veuillez d'abord configurer votre clé API OpenAI",
    apiKeyMissing: "Clé API Requise",
    apiKeyMissingDesc: "Veuillez configurer votre clé API OpenAI pour utiliser le générateur de cartes mémoire",
    configureApiKey: "Configurer la Clé API",
    warningTitle: "Avertissement",
    noteTitle: "Note",
    contentLanguageNote: "Le contenu précédemment généré restera dans sa langue d'origine",
    noLanguageChangeProcessing: "Impossible de changer de langue pendant le traitement",

    // Configuration page
    configTitle: "Configuration de l'IA",
    configDesc: "Configurez vos paramètres API OpenAI pour le générateur de cartes",
    apiKeyLabel: "Clé API OpenAI",
    apiKeyRequired: "La clé API est requise",
    modelLabel: "Nom du Modèle",
    modelRequired: "Le nom du modèle est requis",
    modelHint: "Entrez le nom du modèle OpenAI que vous souhaitez utiliser (ex: gpt-4o-mini, gpt-4o, gpt-3.5-turbo)",
    baseUrlLabel: "URL de Base de l'API",
    configSavedTitle: "Configuration Enregistrée",
    configSavedDesc: "Vos paramètres IA ont été enregistrés avec succès",
    save: "Enregistrer les Modifications",
    cancel: "Annuler",

    // Processing page
    processingTitle: "Traitement de la Transcription",
    processingDesc: "Veuillez patienter pendant l'analyse de votre transcription",
    analyzing: "Analyse de la transcription...",
    generating: "Génération...",
    complete: "Traitement terminé !",
    noTranscript: "Aucune transcription trouvée. Veuillez d'abord télécharger un fichier.",
    aiError: "Erreur de traitement avec l'IA. Veuillez réessayer.",

    // Results page
    resultsTitle: "Cartes Mémoire Générées",
    resultsDesc: "Examinez vos cartes mémoire générées par l'IA",
    cardCount: "Cartes",
    flashcardError: "Erreur lors de la génération de la fiche",
    subjectTitle: "Sujet du Cours",
    outlineTitle: "Plan du Cours",
    readyButton: "Commencer l'Étude",

    // Flashcards page
    flashcardsTitle: "Cartes d'Étude",
    questionLabel: "Question",
    answerLabel: "Réponse",
    showQuestion: "Voir la Question",
    showAnswer: "Voir la Réponse",
    nextButton: "Carte Suivante",
    stopButton: "Terminer la Session",
    loading: "Chargement...",
    noResults: "Aucune carte trouvée. Veuillez recommencer.",

    // Summary page
    summaryTitle: "Résumé de la Session d'Étude",
    summaryDesc: "Consultez les statistiques de votre session d'étude",
    totalCards: "Total des Cartes",
    timeSpent: "Temps Passé",
    accuracy: "Précision",
    startNew: "Nouvelle Session",
    studiedCards: "Cartes Étudiées",
    finishButton: "Terminer et Commencer une Nouvelle Session",
    noFlashcards: "Aucune carte trouvée. Veuillez commencer une nouvelle session.",

    // Settings
    settingsTitle: "Paramètres",
    settingsDesc: "Personnalisez votre expérience de cartes mémoire",
    languageSettings: "Paramètres de Langue",
    themeSettings: "Paramètres de Thème",
    configSettings: "Paramètres de Configuration"
  }
} as const

