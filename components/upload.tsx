"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UploadIcon, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { translations } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"
import { convertDocumentToText } from "@/lib/document-converter"
import { usePdfText } from "@/hooks/usePdfText"
import { ErrorDialog } from "@/components/error-dialog"

async function verifyApiKey() {
  try {
    console.log('🔑 Verifying API key...');
    const response = await fetch('/api/verify-key');
    if (!response.ok) {
      throw new Error(`API key verification failed: ${response.status}`);
    }
    const data = await response.json();
    console.log('🔑 API key verification result:', data.hasApiKey);
    return data.hasApiKey;
  } catch (error) {
    console.error('❌ API key verification error:', error);
    return false;
  }
}

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: ""
  })
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]
  const { text: pdfText, error: pdfError, isExtracting, extractText } = usePdfText()

  useEffect(() => {
    console.log('🔄 Component mounted');
    setMounted(true)
    
    // Check if API key is configured using the secure API endpoint
    async function checkApiKey() {
      const hasKey = await verifyApiKey();
      console.log('🔑 Initial API key check:', hasKey);
      setHasApiKey(hasKey);
    }
    
    checkApiKey();
  }, [])

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    console.log('📥 File dropped');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      console.log('📄 Dropped file:', droppedFile.name, 'Type:', droppedFile.type);
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log('📄 Selected file:', selectedFile.name, 'Type:', selectedFile.type);
      validateAndSetFile(selectedFile)
    }
  }

  const showError = (title: string, message: string) => {
    console.log('🚨 Showing error dialog:', title, message);
    setErrorDialog({
      isOpen: true,
      title,
      message
    })
  }

  const closeErrorDialog = () => {
    console.log('🔄 Closing error dialog');
    setErrorDialog(prev => ({ ...prev, isOpen: false }))
  }

  const validateAndSetFile = async (file: File) => {
    console.log('🔍 Validating file:', file.name);
    // Check if file type is supported
    const isTextFile = file.type === "text/plain"
    const isDocxFile = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    const isPdfFile = file.type === "application/pdf"

    console.log('📋 File type checks:', {
      isTextFile,
      isDocxFile,
      isPdfFile,
      actualType: file.type
    });

    if (!isTextFile && !isDocxFile && !isPdfFile) {
      console.warn('⚠️ Unsupported file type:', file.type);
      showError(t.errorTitle, t.errorFileType);
      return
    }

    // Set the file first to show the progress indicator
    if (isPdfFile) {
      setFile(file);
    }

    try {
      let text: string;
      
      if (isPdfFile) {
        console.log('📑 Processing PDF file...');
        text = await extractText(file);
        console.log('✅ PDF text extracted, length:', text.length);
      } else {
        console.log('📄 Processing non-PDF file...');
        text = await convertDocumentToText(file);
        console.log('✅ Document text extracted, length:', text.length);
      }

      // Check word count
      const wordCount = text.trim().split(/\s+/).length
      console.log('📝 Word count:', wordCount);

      // Check minimum word count
      if (wordCount < 500) {
        console.warn('⚠️ File below minimum word count:', wordCount);
        
        // Create error message with word count
        const errorMessage = t.errorWordCountMin.replace('{count}', wordCount.toLocaleString());
        console.log('🚨 Showing error dialog for minimum word count:', errorMessage);
        
        // Reset file immediately for PDF files
        if (isPdfFile) {
          setFile(null);
        }
        
        // Show error dialog
        showError(t.errorTitle, errorMessage);
        return;
      }

      // Check maximum word count
      if (wordCount > 50000) {
        console.warn('⚠️ File exceeds word limit:', wordCount);
        
        // Create error message with word count
        const errorMessage = t.errorWordCount.replace('{count}', wordCount.toLocaleString());
        console.log('🚨 Showing error dialog for word count:', errorMessage);
        
        // Reset file immediately for PDF files
        if (isPdfFile) {
          setFile(null);
        }
        
        // Show error dialog
        showError(t.errorTitle, errorMessage);
        return;
      }

      // For non-PDF files, set the file after validation
      if (!isPdfFile) {
        setFile(file);
      }
      
      console.log('✅ File validated and set successfully');
      toast({
        title: t.fileReadyTitle,
        description: t.fileReadyDesc,
      })
    } catch (error) {
      console.error('❌ Error processing file:', error);
      
      // Reset file for PDF files
      if (isPdfFile) {
        setFile(null);
      }
      
      // Show error dialog
      showError(t.errorTitle, t.errorProcessing);
    }
  }

  const handleUpload = async () => {
    if (!file) {
      console.warn('⚠️ Attempted upload without file');
      return;
    }

    console.log('📤 Starting upload process for:', file.name);
    setIsUploading(true);
    
    try {
      // Verify API key before processing
      const hasKey = await verifyApiKey();
      console.log('🔑 API key check for upload:', hasKey);
      
      if (!hasKey) {
        console.warn('⚠️ Missing API key');
        showError(t.apiKeyMissing, t.apiKeyMissingDesc);
        setIsUploading(false);
        return;
      }
      
      // Get text content based on file type
      let text: string;
      const isPdfFile = file.type === "application/pdf";
      console.log('📄 Processing file for upload. Is PDF?', isPdfFile);
      
      if (isPdfFile) {
        if (!pdfText) {
          console.log('📑 PDF text not in cache, re-extracting...');
          text = await extractText(file);
        } else {
          console.log('📑 Using cached PDF text, length:', pdfText.length);
          text = pdfText;
        }
      } else {
        console.log('📄 Converting document to text...');
        text = await convertDocumentToText(file);
      }

      console.log('💾 Storing transcript in session storage, length:', text.length);
      // Store the transcript in session storage for processing
      sessionStorage.setItem("transcript", text)

      console.log('🔄 Navigating to processing page...');
      // Navigate to processing page
      router.push("/processing")
    } catch (error) {
      console.error('❌ Upload error:', error);
      showError(t.errorTitle, t.errorProcessing);
      setIsUploading(false);
    } finally {
      setIsUploading(false)
      console.log('🏁 Upload process completed');
    }
  }

  // During SSR or initial load, render a minimal loading state
  if (!mounted || hasApiKey === null) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-10 w-10 mb-4" />
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasApiKey === false) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">{t.apiKeyMissing}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.apiKeyMissingDesc}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div
              className={`flex flex-col items-center justify-center p-6 rounded-lg transition-colors ${
                isDragging ? "bg-primary/10" : "bg-background"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <FileText className="h-10 w-10 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  {isExtracting ? (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm text-muted-foreground">{t.extractingPdf}</p>
                      </div>
                      <Progress value={100} className="w-full animate-pulse" />
                      <p className="text-xs text-center text-muted-foreground">{t.extractingPdfWait}</p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setFile(null)}>
                        {t.change}
                      </Button>
                      <Button onClick={handleUpload} disabled={isUploading || isExtracting}>
                        {isUploading ? t.uploading : t.upload}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <UploadIcon className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.uploadTitle}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{t.uploadDesc}</p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    accept=".txt,.docx,.pdf" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>{t.browseFiles}</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">Supported formats: .txt, .docx, .pdf</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </>
  )
}

