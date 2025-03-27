import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

// Use the params argument for type-safe access
export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params; // Access jobId directly

  const jobData = await redis.get(`pdf-job:${jobId}`)

  if (!jobData) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(jobData)
}
