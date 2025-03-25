"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  ArrowRight,
  BookOpen,
  FileText,
  BrainCircuit,
  Languages,
  Shield,
  BarChart,
  Sparkles,
  Globe,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/translations"
import { AuthHeader } from "@/components/auth-header"

export default function HomePage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleStart = () => {
    router.push("/start")
  }

  // Example flashcards for the landing page
  const flashcardExamples = [
    "What is the difference between mitosis and meiosis?",
    "Define the concept of supply and demand in economics.",
    "Explain the significance of the Pythagorean theorem.",
    "What are the key principles of object-oriented programming?",
    "Describe the process of photosynthesis in plants.",
    "What factors contributed to the start of World War I?",
    "Explain the difference between ionic and covalent bonds.",
    "What is the central dogma of molecular biology?",
    "Describe the function of the three branches of government.",
    "What is the law of conservation of energy?",
    "Explain the concept of cognitive dissonance in psychology.",
    "What are the main components of a neural network?",
  ]

  // Auto-scroll through questions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % flashcardExamples.length)
        setIsTransitioning(false)
      }, 500) // Wait for fade-out animation before changing question
    }, 4000) // Change question every 4 seconds

    return () => clearInterval(interval)
  }, [flashcardExamples.length])

  // Progress bars for each question (randomized but consistent)
  const progressValues = [50, 75, 25, 60, 40, 80, 35, 65, 45, 70, 30, 55]

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>SmartDeck</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.features}
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.howItWorks}
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.testimonials}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-pink-500 to-orange-500 text-primary-foreground shadow hover:bg-primary/80 w-fit">
                  <Sparkles className="mr-1 h-3 w-3" /> {t.aiPoweredLearning}
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                    {t.appTitle}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">{t.appDescription}</p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    {t.startButton} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full max-w-[400px] overflow-hidden rounded-2xl border shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200 dark:bg-pink-900/20 rounded-full filter blur-2xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-2xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      <BrainCircuit className="h-4 w-4" />
                      <span>{t.aiGenerated}</span>
                    </div>
                    <div className="space-y-4 h-[220px] overflow-hidden">
                      {/* Current question with fade transition */}
                      <div
                        className={`rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-4 shadow-sm transition-all duration-500 ${isTransitioning ? "opacity-0 transform -translate-y-4" : "opacity-100 transform translate-y-0"}`}
                      >
                        <p className="font-medium">{flashcardExamples[currentQuestionIndex]}</p>
                        <div className="mt-2 h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            style={{ width: `${progressValues[currentQuestionIndex % progressValues.length]}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Preview of next questions (static) */}
                      <div className="rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-4 shadow-sm">
                        <p className="font-medium text-sm text-muted-foreground">
                          {flashcardExamples[(currentQuestionIndex + 1) % flashcardExamples.length]}
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-4 shadow-sm">
                        <p className="font-medium text-sm text-muted-foreground">
                          {flashcardExamples[(currentQuestionIndex + 2) % flashcardExamples.length]}
                        </p>
                      </div>

                      {/* Indicator dots */}
                      <div className="flex justify-center gap-1 pt-2">
                        {flashcardExamples.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                              index === currentQuestionIndex ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="relative py-20 bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/10"
        >
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                {t.keyFeatures}
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                {t.smartDeckUses}
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`rounded-full p-3 ${featureIcons[index].bgColor}`}>{featureIcons[index].icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative py-20">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-50 to-transparent dark:from-indigo-950/10 dark:to-transparent"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                {t.howItWorks}
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                {t.smartDeckMakes}
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2 rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white ${stepGradients[index]}`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-center text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="relative py-20 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/10 dark:to-background"
        >
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                {t.whatStudentsAreSaying}
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                {t.smartDeckIsHelping}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-xl border bg-white/80 dark:bg-black/20 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                >
                  <div
                    className={`mb-4 text-${testimonialStyles[index].accentColor}-500 dark:text-${testimonialStyles[index].accentColor}-400`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 opacity-70"
                    >
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                    </svg>
                  </div>
                  <p className="mb-4 text-muted-foreground italic">{testimonial.quote}</p>
                  <div className="mt-auto flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full bg-gradient-to-br ${testimonialStyles[index].gradient} flex items-center justify-center text-white font-bold`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-blue-950/30"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-20"></div>

          <div className="container px-4 md:px-6 relative">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                {t.readyToTransform}
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                {t.joinThousands}
              </p>
              <div className="mt-8">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  {t.startButton} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gradient-to-b from-white to-purple-50 dark:from-background dark:to-purple-950/10">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex items-center gap-2 font-bold">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>SmartDeck</span>
          </div>
          <nav className="flex gap-4 md:gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.privacyPolicy}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.termsOfService}
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t.contact}
            </Link>
          </nav>
          <div className="text-sm text-muted-foreground">
            {new Date().getFullYear()} SmartDeck. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature icons data
const featureIcons = [
  {
    icon: <FileText className="h-6 w-6 text-pink-600 dark:text-pink-400" />,
    bgColor: "bg-pink-100 dark:bg-pink-950/50",
  },
  {
    icon: <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
    bgColor: "bg-purple-100 dark:bg-purple-950/50",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
  },
  {
    icon: <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
    bgColor: "bg-blue-100 dark:bg-blue-950/50",
  },
  {
    icon: <Languages className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
    bgColor: "bg-cyan-100 dark:bg-cyan-950/50",
  },
  {
    icon: <Shield className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
    bgColor: "bg-teal-100 dark:bg-teal-950/50",
  },
]

// Feature cards
const featureCards = [
  {
    title: "Transcript Upload",
    description: "Easily upload plain text or PDF transcripts from your courses.",
  },
  {
    title: "AI Analysis",
    description: "Automatic extraction of course subject and detailed outline.",
  },
  {
    title: "Flashcard Generation",
    description: "Create customizable sets of AI-generated flashcards.",
  },
  {
    title: "Multiple Choice Questions",
    description: "Generate and take AI-powered MCQ quizzes with enhanced visual feedback.",
  },
  {
    title: "Multi-language Support",
    description: "Available in English and French with more languages coming soon.",
  },
  {
    title: "Security Features",
    description: "Rate limiting, request validation, and comprehensive logging.",
  },
]

// How it works steps
const howItWorksSteps = [
  {
    title: "Upload",
    description: "Upload your course transcript or PDF file on the home page.",
  },
  {
    title: "Process",
    description: "Our AI analyzes your content and extracts key concepts.",
  },
  {
    title: "Study",
    description: "Choose between flashcards or MCQs and start studying effectively.",
  },
]

// Step gradients
const stepGradients = [
  "bg-gradient-to-r from-pink-500 to-purple-500",
  "bg-gradient-to-r from-purple-500 to-indigo-500",
  "bg-gradient-to-r from-indigo-500 to-blue-500",
]

// Testimonials
const testimonials = [
  {
    quote:
      "SmartDeck completely transformed how I study for my biology exams. The AI-generated flashcards saved me hours of preparation time and helped me focus on the most important concepts.",
    name: "Emily Johnson",
    role: "Medical Student, Stanford University",
    initials: "EJ",
  },
  {
    quote:
      "As a computer science major, I have to absorb a lot of technical information quickly. SmartDeck's MCQ generator helps me test my knowledge and identify gaps in my understanding.",
    name: "David Chen",
    role: "CS Student, MIT",
    initials: "DC",
  },
  {
    quote:
      "I used to spend hours creating study materials. With SmartDeck, I upload my lecture notes and instantly get high-quality flashcards. My grades have improved significantly this semester!",
    name: "Sophia Rodriguez",
    role: "Psychology Major, UCLA",
    initials: "SR",
  },
  {
    quote:
      "The PDF processing feature is a game-changer. I can upload all my course readings and SmartDeck extracts the key information. It's like having a personal tutor that understands exactly what I need to learn.",
    name: "James Wilson",
    role: "MBA Student, Harvard Business School",
    initials: "JW",
  },
  {
    quote:
      "As a teaching assistant, I recommend SmartDeck to all my students. It helps them engage with the material more deeply and come to class better prepared for discussions.",
    name: "Olivia Taylor",
    role: "TA, Princeton University",
    initials: "OT",
  },
  {
    quote:
      "The multi-language support is fantastic for international students like me. I can study in both English and French, which helps me better understand complex concepts in my native language.",
    name: "Alexandre Dubois",
    role: "Engineering Student, ETH Zurich",
    initials: "AD",
  },
]

// Testimonial styles
const testimonialStyles = [
  {
    accentColor: "purple",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    accentColor: "indigo",
    gradient: "from-indigo-500 to-blue-600",
  },
  {
    accentColor: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    accentColor: "pink",
    gradient: "from-pink-500 to-purple-600",
  },
  {
    accentColor: "cyan",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    accentColor: "teal",
    gradient: "from-teal-500 to-emerald-600",
  },
]
