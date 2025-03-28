import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { config } from '@/lib/config' // Import config
import pdf from 'pdf-parse' // Import pdf-parse

// Route Segment Config export is not used for body size limit in App Router

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')

  // --- Backend Validation ---
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
  }

  if (file.size > config.maxFileSizeBytes) {
    return NextResponse.json(
      { error: `File exceeds maximum size limit of ${config.maxFileSizeMB}MB.` },
      { status: 413 } // Payload Too Large
    );
  }
  // --- End Validation ---

  const jobId = uuidv4()

  // Store initial job status *after* validation passes
  await redis.set(`pdf-job:${jobId}`, {
    status: 'processing',
    progress: 0,
    startedAt: new Date().toISOString()
  })

  // Process in background (non-blocking)
  processPdf(jobId, file).catch(console.error)

  return NextResponse.json({ jobId }) // Restore original response
}

async function processPdf(jobId: string, file: File) {
  let text = ''

  try {
    // 1. Read the file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Update progress before extraction
    await redis.set(`pdf-job:${jobId}`, {
      status: 'processing',
      progress: 30, // Progress before extraction
      updatedAt: new Date().toISOString()
    })

    // 2. Extract text using pdf-parse
    const data = await pdf(buffer)
    console.log(`✅ [pdf-parse] Extracted text from ${data.numpages} pages. Info:`, data.info) // Log info for debugging

    // Update progress after extraction
    await redis.set(`pdf-job:${jobId}`, {
      status: 'processing',
      progress: 70, // Progress after extraction
      updatedAt: new Date().toISOString()
    })

    // 3. Get extracted text
    text = data.text.trim() // pdf-parse returns a single string

    // 4. Mark job as completed in Redis
    await redis.set(`pdf-job:${jobId}`, {
      status: 'completed',
      progress: 100,
      result: text,
      completedAt: new Date().toISOString()
    })
  } catch (error) {
    await redis.set(`pdf-job:${jobId}`, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'PDF extraction failed',
      failedAt: new Date().toISOString()
    })
    // No temporary file cleanup needed
  }
}
