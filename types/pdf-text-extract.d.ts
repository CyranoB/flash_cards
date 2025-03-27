// Basic declaration for pdf-text-extract
// This tells TypeScript the module exists and defines the 'extract' function signature.
// It assumes the callback provides an Error object or null, and an array of strings (pages) or undefined.
declare module 'pdf-text-extract' {
  export function extract(
    filePath: string, 
    callback: (err: Error | null, pages: string[] | undefined) => void
  ): void;

  // Add other exports here if you use them, e.g., options objects
  // export function extract(filePath: string, options: any, callback: (err: Error | null, pages: string[] | undefined) => void): void;
}
