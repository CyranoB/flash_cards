import { redis } from '@/lib/redis' // Keep only one import
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs/promises' // Use promises API for async file operations
import os from 'os'
import path from 'path'
// Use require and assume it might be the default export
const extract = require('pdf-text-extract')

// Route Segment Config export is not used for body size limit in App Router

export async function POST(request: Request) {
  // console.log('API Route /api/pdf-extract/trigger reached!'); // Remove test logging

  const jobId = uuidv4()
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Store initial job status
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
  const tempDir = os.tmpdir()
  // Create a unique temporary file path
  const tempFilePath = path.join(tempDir, `${jobId}-${file.name}`) 
  let text = ''

  try {
    // 1. Save the uploaded file temporarily
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(tempFilePath, buffer)

    // Update progress before extraction
    await redis.set(`pdf-job:${jobId}`, {
      status: 'processing',
      progress: 30, // Progress before extraction
      updatedAt: new Date().toISOString()
    })

    // 2. Extract text using pdf-text-extract
    // Add types to the callback parameters
    const extractedPages: string[] = await new Promise((resolve, reject) => {
      extract(tempFilePath, (err: Error | null, pages: string[] | undefined) => {
        if (err) {
          console.error('❌ [pdf-text-extract] Error:', err)
          return reject(err)
        }
        if (!pages) {
          // Handle case where pages might be undefined on success (though unlikely based on usage)
          return reject(new Error('PDF text extraction returned undefined pages.'))
        }
        console.log(`✅ [pdf-text-extract] Extracted ${pages.length} pages.`)
        resolve(pages)
      })
    })
    
    // Update progress after extraction
    await redis.set(`pdf-job:${jobId}`, {
      status: 'processing',
      progress: 70, // Progress after extraction
      updatedAt: new Date().toISOString()
    })

    // 3. Join extracted pages
    text = extractedPages.join('\n\n').trim()

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
  } finally {
    // 5. Clean up: Delete the temporary file regardless of success/failure
    try {
      await fs.unlink(tempFilePath)
      console.log(`🧹 Cleaned up temporary file: ${tempFilePath}`)
    } catch (cleanupError) {
      console.error(`⚠️ Failed to clean up temporary file ${tempFilePath}:`, cleanupError)
      // Log the error but don't throw, as the main operation might have succeeded
    }
  }
}
