import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Extract jobId from URL path
  const url = new URL(request.url);
  const jobId = url.pathname.split('/').pop();
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID not provided' },
      { status: 400 }
    );
  }

  const jobData = await redis.get(`pdf-job:${jobId}`)

  if (!jobData) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(jobData)
}
