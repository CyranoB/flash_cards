export const translations = {
  en: {
    // General
    loading: "Loading...",
    errorTitle: "Error",
    warningTitle: "Warning",
    noteTitle: "Note",

    // Upload page
    uploadTitle: "Upload Course Transcript",
    uploadDesc: "Drag and drop your text file here, or click to browse",
    browseFiles: "Browse Files",
    change: "Change",
    upload: "Upload",
    uploading: "Uploading...",
    fileReadyTitle: "File Ready",
    fileReadyDesc: "Your file is ready to be processed",
    errorFileType: "Please upload a plain text (.txt) file",
    errorWordCount: "Transcript exceeds 50,000 word limit",
    errorProcessing: "Error processing file",
    apiKeyMissing: "OpenAI API Key Required",
    apiKeyMissingDesc: "Please configure your OpenAI API key before uploading transcripts",
    configureApiKey: "Configure API Key",
    noApiKey: "OpenAI API key is not configured. Please go to settings to add your API key.",

    // Processing page
    processingTitle: "Processing Your Transcript",
    analyzing: "Analyzing transcript...",
    complete: "Analysis complete!",
    noTranscript: "No transcript found. Please upload a file first.",
    aiError: "Error processing with AI. Please try again.",
    noLanguageChangeProcessing: "Cannot change language during processing. Please wait until processing is complete.",

    // Results page
    resultsTitle: "Course Analysis Results",
    subjectTitle: "Course Subject",
    outlineTitle: "Course Outline",
    readyButton: "Ready!",
    noResults: "No results found. Please start over.",

    // Flashcards page
    flashcardsTitle: "Study Flashcards",
    questionLabel: "Question",
    answerLabel: "Answer",
    showQuestion: "Show Question",
    showAnswer: "Show Answer",
    nextButton: "Next",
    stopButton: "Stop",
    generating: "Generating...",
    cardCount: "Cards",
    flashcardError: "Error generating flashcard",
    contentLanguageNote:
      "Changing the interface language will not affect the language of existing content. New content will use the selected language.",

    // Summary page
    summaryTitle: "Study Session Summary",
    studiedCards: "Total cards studied",
    finishButton: "Finish & Start Over",
    noFlashcards: "No flashcards found. Please start over.",

    // Config page
    configTitle: "OpenAI Configuration",
    configDesc: "Configure your OpenAI API settings",
    apiKeyLabel: "API Key",
    modelLabel: "Model",
    baseUrlLabel: "API Base URL",
    save: "Save",
    cancel: "Cancel",
    configSavedTitle: "Configuration Saved",
    configSavedDesc: "Your OpenAI API settings have been saved",
    apiKeyRequired: "API Key is required",
    configSettings: "Configuration Settings",
  },
  fr: {
    // General
    loading: "Chargement...",
    errorTitle: "Erreur",
    warningTitle: "Avertissement",
    noteTitle: "Remarque",

    // Upload page
    uploadTitle: "Télécharger la Transcription du Cours",
    uploadDesc: "Glissez-déposez votre fichier texte ici, ou cliquez pour parcourir",
    browseFiles: "Parcourir les Fichiers",
    change: "Changer",
    upload: "Télécharger",
    uploading: "Téléchargement...",
    fileReadyTitle: "Fichier Prêt",
    fileReadyDesc: "Votre fichier est prêt à être traité",
    errorFileType: "Veuillez télécharger un fichier texte (.txt)",
    errorWordCount: "La transcription dépasse la limite de 50 000 mots",
    errorProcessing: "Erreur lors du traitement du fichier",
    apiKeyMissing: "Clé API OpenAI Requise",
    apiKeyMissingDesc: "Veuillez configurer votre clé API OpenAI avant de télécharger des transcriptions",
    configureApiKey: "Configurer la Clé API",
    noApiKey: "La clé API OpenAI n'est pas configurée. Veuillez aller dans les paramètres pour ajouter votre clé API.",

    // Processing page
    processingTitle: "Traitement de Votre Transcription",
    analyzing: "Analyse de la transcription...",
    complete: "Analyse terminée !",
    noTranscript: "Aucune transcription trouvée. Veuillez d'abord télécharger un fichier.",
    aiError: "Erreur de traitement avec l'IA. Veuillez réessayer.",
    noLanguageChangeProcessing:
      "Impossible de changer de langue pendant le traitement. Veuillez attendre la fin du traitement.",

    // Results page
    resultsTitle: "Résultats de l'Analyse du Cours",
    subjectTitle: "Sujet du Cours",
    outlineTitle: "Plan du Cours",
    readyButton: "Prêt !",
    noResults: "Aucun résultat trouvé. Veuillez recommencer.",

    // Flashcards page
    flashcardsTitle: "Fiches d'Étude",
    questionLabel: "Question",
    answerLabel: "Réponse",
    showQuestion: "Afficher la Question",
    showAnswer: "Afficher la Réponse",
    nextButton: "Suivant",
    stopButton: "Arrêter",
    generating: "Génération...",
    cardCount: "Cartes",
    flashcardError: "Erreur lors de la génération de la fiche",
    contentLanguageNote:
      "Le changement de langue de l'interface n'affectera pas la langue du contenu existant. Le nouveau contenu utilisera la langue sélectionnée.",

    // Summary page
    summaryTitle: "Résumé de la Session d'Étude",
    studiedCards: "Total des cartes étudiées",
    finishButton: "Terminer et Recommencer",
    noFlashcards: "Aucune fiche trouvée. Veuillez recommencer.",

    // Config page
    configTitle: "Configuration OpenAI",
    configDesc: "Configurez vos paramètres d'API OpenAI",
    apiKeyLabel: "Clé API",
    modelLabel: "Modèle",
    baseUrlLabel: "URL de base de l'API",
    save: "Enregistrer",
    cancel: "Annuler",
    configSavedTitle: "Configuration Enregistrée",
    configSavedDesc: "Vos paramètres d'API OpenAI ont été enregistrés",
    apiKeyRequired: "La clé API est requise",
    configSettings: "Paramètres de Configuration",
  },
}

