import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

// Use the params argument for type-safe access
export async function GET(request: Request, { params }: { params: { jobId: string } }) {
  // Properly await params in Next.js 15
  const { jobId } = await params;

  const jobData = await redis.get(`pdf-job:${jobId}`)

  if (!jobData) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(jobData)
}
