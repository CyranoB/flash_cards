"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UploadIcon, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"; 
import { translations } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"
import { convertDocumentToText } from "@/lib/document-converter"
import { ErrorDialog } from "@/components/error-dialog"
import { config } from "@/lib/config"

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: ""
  })
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]
  const [jobId, setJobId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Effect to poll job status
  useEffect(() => {
    if (!jobId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pdf-extract/status/${jobId}`)
        const data = await response.json()
        
        if (data.status === 'completed') {
          clearInterval(pollInterval)
          setIsProcessing(false)
          setExtractionProgress(100)
          toast({
            title: t.processingComplete,
            description: t.processingCompleteDesc,
          })
        } else if (data.status === 'failed') {
          clearInterval(pollInterval)
          setIsProcessing(false)
          showError(t.errorTitle, data.error || t.errorPdfProcessing)
        } else if (data.progress) {
          setExtractionProgress(data.progress)
        }
      } catch (error) {
        clearInterval(pollInterval)
        setIsProcessing(false)
        showError(t.errorTitle, t.errorPdfProcessing)
      }
    }, 1000)

    return () => clearInterval(pollInterval)
  }, [jobId, t])

  useEffect(() => {
    console.log('🔄 [UPLOAD] Component mounted');
    setMounted(true)
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
    console.log('🔍 [UPLOAD] Validating file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    // Check if file type is supported
    const isTextFile = file.type === "text/plain"
    const isDocxFile = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    const isPdfFile = file.type === "application/pdf"

    console.log('📋 [UPLOAD] File type checks:', {
      isTextFile,
      isDocxFile,
      isPdfFile,
      actualType: file.type
    });

    if (!isTextFile && !isDocxFile && !isPdfFile) {
      console.warn('⚠️ [UPLOAD] Unsupported file type:', file.type);
      showError(t.errorTitle, t.errorFileType);
      return
    }
    
    // Check file size using configurable limit
    const maxFileSize = config.maxFileSizeBytes; // Get from config
    if (file.size > maxFileSize) {
      console.warn('⚠️ [UPLOAD] File too large:', (file.size / 1024 / 1024).toFixed(2), 'MB (limit:', config.maxFileSizeMB, 'MB)');
      // Replace the placeholder in the translation string
      const errorMessage = t.errorFileSize.replace('{limit}', config.maxFileSizeMB.toString());
      showError(t.errorTitle, errorMessage);
      return;
    }

    // Set the file first to show the progress indicator
    if (isPdfFile) {
      console.log('📑 [UPLOAD] Setting PDF file to state to show progress indicator');
      setFile(file);
    }

    try {
      // For non-PDF files, we process immediately
      if (!isPdfFile) {
        console.log('📄 [UPLOAD] Processing non-PDF file...');
        const text = await convertDocumentToText(file);
        console.log('✅ [UPLOAD] Document text extracted, length:', text.length);

        // Check word count
        const wordCount = text.trim().split(/\s+/).length
        console.log('📝 [UPLOAD] Word count:', wordCount);

        // Check minimum word count
        if (wordCount < 500) {
          console.warn('⚠️ [UPLOAD] File below minimum word count:', wordCount);
          const errorMessage = t.errorWordCountMin.replace('{count}', wordCount.toLocaleString());
          showError(t.errorTitle, errorMessage);
          return;
        }

        // Check maximum word count
        if (wordCount > 50000) {
          console.warn('⚠️ [UPLOAD] File exceeds word limit:', wordCount);
          const errorMessage = t.errorWordCount.replace('{count}', wordCount.toLocaleString());
          showError(t.errorTitle, errorMessage);
          return;
        }

        setFile(file);
        console.log('✅ [UPLOAD] File validated and set successfully');
        toast({
          title: t.fileReadyTitle,
          description: t.fileReadyDesc,
        })
        return;
      }
      
      // For PDF files, we start async processing
      if (isPdfFile) {
        console.log('📑 [UPLOAD] Starting PDF text extraction process...');
        setIsProcessing(true)
        
        try {
          const formData = new FormData()
          formData.append('file', file)
          
          // Correct the API endpoint path
          const response = await fetch('/api/pdf-extract', { 
            method: 'POST',
            body: formData
          })
          
          const { jobId } = await response.json()
          setJobId(jobId)
          
          toast({
            title: t.processingPdf,
            description: t.processingPdfDesc,
          })
        } catch (error) {
          console.error('❌ [UPLOAD] Failed to start PDF processing:', error)
          setIsProcessing(false)
          setFile(null)
          showError(t.errorTitle, t.errorPdfProcessing)
          return
        }
      }
    } catch (error) {
      console.error('❌ [UPLOAD] Error processing file:', error);
      
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
      console.warn('⚠️ [UPLOAD] Attempted upload without file');
      return;
    }

    console.log('📤 [UPLOAD] Starting upload process for:', file.name);
    setIsUploading(true);
    
    try {
      let text: string;
      const isPdfFile = file.type === "application/pdf";
      
      if (isPdfFile) {
        // Get the completed job result
        const response = await fetch(`/api/pdf-extract/status/${jobId}`)
        const data = await response.json()
        
        if (data.status !== 'completed' || !data.result) {
          throw new Error('PDF processing not completed')
        }
        text = data.result
        
        // Validate PDF text word count *after* extraction
        const wordCount = text.trim().split(/\s+/).length;
        console.log('📝 [UPLOAD] PDF Word count:', wordCount);
        if (wordCount < 500) {
          const errorMessage = t.errorWordCountMin.replace('{count}', wordCount.toLocaleString());
          showError(t.errorTitle, errorMessage);
          setIsUploading(false); // Ensure button is re-enabled
          return; 
        }
        if (wordCount > 50000) {
          const errorMessage = t.errorWordCount.replace('{count}', wordCount.toLocaleString());
          showError(t.errorTitle, errorMessage);
          setIsUploading(false); // Ensure button is re-enabled
          return;
        }
        
      } else {
        // Text for non-PDFs was already validated in validateAndSetFile
        text = await convertDocumentToText(file)
      }

      console.log('💾 [UPLOAD] Storing transcript in session storage');
      sessionStorage.setItem("transcript", text)
      router.push("/processing")
    } catch (error) {
      console.error('❌ [UPLOAD] Upload error:', error);
      showError(t.errorTitle, t.errorProcessing);
      setIsUploading(false);
    } finally {
      setIsUploading(false)
      console.log('🏁 [UPLOAD] Upload process completed');
    }
  }

  // During SSR, render a minimal loading state
  if (!mounted) {
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

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <Card className="border-2 border-dashed">
          <CardContent className="p-6">
            <div
              className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-lg transition-colors w-auto max-w-full mx-auto ${
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
                  {isProcessing ? (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-sm text-muted-foreground">{t.extractingPdf}</p>
                      </div>
                      <Progress value={extractionProgress} className="w-full" />
                      <p className="text-xs text-center text-muted-foreground">{t.extractingPdfWait}</p>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => {
                        console.log('🔄 [UPLOAD] File change requested, resetting state');
                        setFile(null);
                        setJobId(null);
                      }}>
                        {t.change}
                      </Button>
                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || isProcessing}
                        className={isUploading || isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t.uploading}</span>
                          </div>
                        ) : t.upload}
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
