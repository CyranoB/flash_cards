import { getServerConfig } from '@/lib/env-check'

export default function ServerConfigCheck({
  children,
}: {
  children: React.ReactNode
}) {
  const { isConfigured } = getServerConfig()

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card rounded-lg shadow-lg p-6 border-2 border-destructive">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Application Not Configured
              </h2>
              <p className="text-muted-foreground mb-4">
                Please configure the application by setting up the required environment variables:
              </p>
              <div className="text-left bg-muted p-4 rounded-md mb-4">
                <p className="font-mono text-sm mb-2">1. Create a <code className="bg-background px-1 rounded">.env</code> file in the root directory</p>
                <p className="font-mono text-sm mb-2">2. Add your OpenAI API key:</p>
                <pre className="bg-background p-2 rounded overflow-x-auto">
                  <code>OPENAI_API_KEY=your_api_key_here</code>
                </pre>
              </div>
              <p className="text-sm text-muted-foreground">
                Restart the application after configuring the environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
} 