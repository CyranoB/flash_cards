"use client"

import { Upload } from "@/components/upload"
import { AuthHeader } from "@/components/auth-header"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1">
        <Upload />
      </main>
    </div>
  )
}
