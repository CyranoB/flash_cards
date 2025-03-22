import { useState, useCallback } from 'react';
import PDFToText from 'react-pdftotext';

export function usePdfText() {
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractText = useCallback(async (file: File) => {
    setIsExtracting(true);
    console.log('🔍 PDF Extraction: Starting extraction for file:', file.name);
    console.log('📄 PDF File type:', file.type);
    console.log('📦 PDF File size:', file.size, 'bytes');
    
    try {
      console.log('⏳ PDF Extraction: Calling PDFToText...');
      const extractedText = await PDFToText(file);
      console.log('✅ PDF Extraction: Raw text extracted, length:', extractedText.length);
      
      const normalizedText = extractedText
        .replace(/[\r\n]+/g, '\n')  // Normalize line endings
        .replace(/\n\s+\n/g, '\n\n')  // Remove extra blank lines
        .trim();
      
      console.log('✨ PDF Extraction: Text normalized, final length:', normalizedText.length);
      setText(normalizedText);
      setError(null);
      
      setIsExtracting(false);
      return normalizedText;
    } catch (err) {
      console.error('❌ PDF Extraction Error:', err);
      const errorMessage = 'Failed to extract text from PDF';
      setError(errorMessage);
      setText('');
      
      setIsExtracting(false);
      throw new Error(errorMessage);
    }
  }, []);

  return { text, error, isExtracting, extractText };
} 