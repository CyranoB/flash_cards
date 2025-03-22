import mammoth from 'mammoth';

export async function convertDocxToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        
        const arrayBuffer = event.target.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        
        // Remove extra whitespace and normalize line endings
        const text = result.value
          .replace(/[\r\n]+/g, '\n')  // Normalize line endings
          .replace(/\n\s+\n/g, '\n\n')  // Remove extra blank lines
          .trim();
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export async function convertDocumentToText(file: File): Promise<string> {
  switch (file.type) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return await convertDocxToText(file);
    case 'text/plain':
      return await file.text();
    default:
      throw new Error('Unsupported file type');
  }
} 