import { useState, useCallback, useEffect, useRef } from 'react';
import PDFToText from 'react-pdftotext';

// Define a type for the worker status
type ExtractionStatus = 'idle' | 'extracting' | 'success' | 'error';

export function usePdfText() {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const extractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup function to reset all timers
  const cleanupTimers = useCallback(() => {
    console.log(' [PDF] Cleaning up timers');
    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
      extractionTimeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(' [PDF] Component unmounting, cleaning up resources');
      cleanupTimers();
    };
  }, [cleanupTimers]);

  const extractText = useCallback(async (file: File) => {
    console.log(` [PDF] EXTRACTION START: File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB, Type: ${file.type}`);
    
    // Reset state
    setText('');
    setError(null);
    setIsExtracting(true);
    setStatus('extracting');
    startTimeRef.current = Date.now();
    
    return new Promise<string>((resolve, reject) => {
      console.log(' [PDF] Creating extraction promise wrapper');
      
      // Set up progress logging
      progressIntervalRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        console.log(` [PDF] Extraction in progress: ${elapsedSeconds}s elapsed`);
      }, 2000);

      // Set up extraction timeout (30 seconds)
      extractionTimeoutRef.current = setTimeout(() => {
        console.log(' [PDF] Extraction timeout reached (30s)');
        cleanupTimers();
        setIsExtracting(false);
        setStatus('error');
        setError('PDF extraction timed out');
        reject(new Error('PDF extraction timed out after 30 seconds'));
      }, 30000);

      // Small delay to allow UI to update
      setTimeout(async () => {
        try {
          console.log(' [PDF] Starting actual PDF text extraction');
          
          // Start PDFToText in a non-blocking approach
          const textExtractionPromise = new Promise<string>((resolveExtraction) => {
            console.log(' [PDF] Initiating PDFToText');
            PDFToText(file)
              .then((result) => {
                console.log(` [PDF] PDFToText extraction succeeded, raw length: ${result.length}`);
                resolveExtraction(result);
              })
              .catch((err) => {
                console.error(' [PDF] PDFToText extraction failed:', err);
                throw err;
              });
          });
          
          console.log(' [PDF] Awaiting text extraction result');
          const extractedText = await textExtractionPromise;
          
          // Extraction succeeded, clean up
          cleanupTimers();
          
          // Process text
          console.log(' [PDF] Processing extracted text');
          const normalizedText = extractedText
            .replace(/[\r\n]+/g, '\n')
            .replace(/\n\s+\n/g, '\n\n')
            .trim();
          
          // Update state and resolve promise
          const totalTime = (Date.now() - startTimeRef.current) / 1000;
          console.log(` [PDF] Extraction complete in ${totalTime.toFixed(1)}s, final text length: ${normalizedText.length}`);
          
          setText(normalizedText);
          setIsExtracting(false);
          setStatus('success');
          resolve(normalizedText);
        } catch (err) {
          cleanupTimers();
          console.error(' [PDF] Extraction error:', err);
          
          if (err instanceof Error) {
            console.error(' [PDF] Error details:', {
              message: err.message,
              name: err.name,
              stack: err.stack
            });
          }
          
          setIsExtracting(false);
          setStatus('error');
          setError('Failed to extract text from PDF');
          reject(new Error('Failed to extract text from PDF'));
        }
      }, 100);
    });
  }, [cleanupTimers]);

  return { text, error, isExtracting, extractText, status };
}