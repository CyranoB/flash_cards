"use client"

import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

export function ConfigButton() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <Button variant="ghost" size="icon" onClick={() => router.push("/config")} title={t.configSettings}>
      <Settings className="h-5 w-5" />
    </Button>
  )
}

