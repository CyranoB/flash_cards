// Server-side environment configuration check
let isConfigured: boolean | null = null;

export function checkServerConfig() {
  if (isConfigured === null) {
    isConfigured = !!process.env.OPENAI_API_KEY;
    if (!isConfigured) {
      console.warn('⚠️ Application not configured: Missing OpenAI API key');
    } else {
      console.log('✅ Application configured: OpenAI API key found');
    }
  }
  return isConfigured;
}

// This should only be called server-side
export function getServerConfig() {
  if (isConfigured === null) {
    checkServerConfig();
  }
  return {
    isConfigured: !!isConfigured
  };
} 