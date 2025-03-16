"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"

export default function ConfigPage() {
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState("gpt-4o-mini")
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1")
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    // Load saved configuration
    const savedApiKey = localStorage.getItem("openai_api_key")
    const savedModel = localStorage.getItem("openai_model")
    const savedBaseUrl = localStorage.getItem("openai_base_url")

    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
    if (savedBaseUrl) setBaseUrl(savedBaseUrl)
  }, [])

  const handleSave = () => {
    if (!apiKey) {
      toast({
        title: t.errorTitle,
        description: t.apiKeyRequired,
        variant: "destructive",
      })
      return
    }

    if (!model) {
      toast({
        title: t.errorTitle,
        description: t.modelRequired,
        variant: "destructive",
      })
      return
    }

    // Save configuration
    localStorage.setItem("openai_api_key", apiKey)
    localStorage.setItem("openai_model", model)
    localStorage.setItem("openai_base_url", baseUrl)

    toast({
      title: t.configSavedTitle,
      description: t.configSavedDesc,
    })

    // Redirect to home
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{t.configTitle}</CardTitle>
            <CardDescription>{t.configDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">{t.apiKeyLabel}</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">{t.modelLabel}</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
              <p className="text-sm text-muted-foreground">{t.modelHint}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="base-url">{t.baseUrlLabel}</Label>
              <Input
                id="base-url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave}>{t.save}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

