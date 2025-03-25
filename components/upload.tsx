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
import { usePdfText } from "@/hooks/usePdfText"
import { ErrorDialog } from "@/components/error-dialog"

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
  const { text: pdfText, error: pdfError, isExtracting, extractText, status } = usePdfText()

  // Effect to handle PDF extraction status
  useEffect(() => {
    console.log(`🔄 [UPLOAD] PDF extraction status changed to: ${status}`);
    
    if (status === 'error' && pdfError) {
      console.error('❌ [UPLOAD] PDF extraction error detected:', pdfError);
      showError(t.errorTitle, t.errorPdfProcessing);
      setFile(null);
    }
    
    // Reset progress when extraction is not happening
    if (!isExtracting) {
      setExtractionProgress(0);
    }
  }, [status, pdfError, isExtracting, t]);

  // Effect to simulate progress for UI feedback during extraction
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    
    if (isExtracting) {
      console.log('🔄 [UPLOAD] Starting progress simulation for extraction');
      // Simulate progress for better UX - actual extraction doesn't report progress
      progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          // Cap at 90% as we don't know actual completion
          const newProgress = Math.min(prev + 1, 90);
          return newProgress;
        });
      }, 300);
    } else if (progressInterval) {
      clearInterval(progressInterval);
      
      if (status === 'success') {
        // When complete, jump to 100%
        setExtractionProgress(100);
      }
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isExtracting, status]);

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

    // Set the file first to show the progress indicator
    if (isPdfFile) {
      console.log('📑 [UPLOAD] Setting PDF file to state to show progress indicator');
      setFile(file);
    }

    try {
      let text: string;
      
      if (isPdfFile) {
        console.log('📑 [UPLOAD] Starting PDF text extraction process...');
        toast({
          title: t.processingPdf,
          description: t.processingPdfDesc,
        });
        
        // Set a timeout to show a second toast for long-running extractions
        const longExtractionTimer = setTimeout(() => {
          console.log('⏱️ [UPLOAD] PDF extraction taking longer than expected');
          toast({
            title: t.processingPdfLong,
            description: t.processingPdfLongDesc,
            duration: 5000,
          });
        }, 10000); // Show after 10 seconds
        
        try {
          console.log('🧩 [UPLOAD] Calling extractText function...');
          text = await extractText(file);
          clearTimeout(longExtractionTimer);
          
          // Verify extracted text
          if (!text || text.trim().length === 0) {
            console.error('❌ [UPLOAD] PDF extraction returned empty text');
            throw new Error('PDF extraction returned empty text');
          }
          
          console.log('✅ [UPLOAD] PDF text extracted successfully, length:', text.length);
          toast({
            title: t.processingComplete,
            description: t.processingCompleteDesc,
          });
        } catch (pdfError) {
          clearTimeout(longExtractionTimer);
          console.error('❌ [UPLOAD] PDF extraction error:', pdfError);
          // Reset file state
          setFile(null);
          showError(t.errorTitle, t.errorPdfProcessing);
          return;
        }
      } else {
        console.log('📄 [UPLOAD] Processing non-PDF file...');
        text = await convertDocumentToText(file);
        console.log('✅ [UPLOAD] Document text extracted, length:', text.length);
      }

      // Check word count
      const wordCount = text.trim().split(/\s+/).length
      console.log('📝 [UPLOAD] Word count:', wordCount);

      // Check minimum word count
      if (wordCount < 500) {
        console.warn('⚠️ [UPLOAD] File below minimum word count:', wordCount);
        
        // Create error message with word count
        const errorMessage = t.errorWordCountMin.replace('{count}', wordCount.toLocaleString());
        console.log('🚨 [UPLOAD] Showing error dialog for minimum word count:', errorMessage);
        
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
        console.warn('⚠️ [UPLOAD] File exceeds word limit:', wordCount);
        
        // Create error message with word count
        const errorMessage = t.errorWordCount.replace('{count}', wordCount.toLocaleString());
        console.log('🚨 [UPLOAD] Showing error dialog for word count:', errorMessage);
        
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
      
      console.log('✅ [UPLOAD] File validated and set successfully');
      toast({
        title: t.fileReadyTitle,
        description: t.fileReadyDesc,
      })
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
      // Get text content based on file type
      let text: string;
      const isPdfFile = file.type === "application/pdf";
      console.log('📄 [UPLOAD] Processing file for upload. Is PDF?', isPdfFile);
      
      if (isPdfFile) {
        if (!pdfText) {
          console.log('📑 [UPLOAD] PDF text not in cache, re-extracting...');
          try {
            text = await extractText(file);
            if (!text || text.trim().length === 0) {
              throw new Error('PDF re-extraction returned empty text');
            }
          } catch (error) {
            console.error('❌ [UPLOAD] Error re-extracting PDF text:', error);
            throw new Error('Failed to extract text from PDF');
          }
        } else {
          console.log('📑 [UPLOAD] Using cached PDF text, length:', pdfText.length);
          text = pdfText;
        }
      } else {
        console.log('📄 [UPLOAD] Converting document to text...');
        text = await convertDocumentToText(file);
      }

      console.log('💾 [UPLOAD] Storing transcript in session storage, length:', text.length);
      // Store the transcript in session storage for processing
      sessionStorage.setItem("transcript", text)

      console.log('🔄 [UPLOAD] Navigating to processing page...');
      // Navigate to processing page
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
                  {isExtracting ? (
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
                      }}>
                        {t.change}
                      </Button>
                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || isExtracting}
                        className={isUploading || isExtracting ? "opacity-50 cursor-not-allowed" : ""}
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
