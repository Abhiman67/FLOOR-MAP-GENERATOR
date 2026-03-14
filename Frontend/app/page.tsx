"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HeroSection from "@/components/hero-section"
import InputPanel from "@/components/input-panel"
import LoadingState from "@/components/loading-state"
import ResultsGrid from "@/components/results-grid"
import StatsDashboard from "@/components/stats-dashboard"
import ThemeToggle from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'

interface FloorPlanResult {
  image_url: string
  details: {
    filename: string
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
  }
  metadata: {
    match_quality: string
    sq_ft_difference: number
    rank: number
  }
  vastu?: {
    score: number
    compliance_level: string
    emoji: string
    details: Array<{
      aspect: string
      direction: string
      status: string
      score: number
      message: string
    }>
    recommendations: string[]
  }
}

export default function Page() {
  const [state, setState] = useState<"input" | "loading" | "result">("input")
  const [formData, setFormData] = useState({
    sq_ft: 2500,
    bedrooms: 3,
    bathrooms: 2,
    garage: 2,
    vastu_compliant: false,
    min_vastu_score: 0,
  })
  const [results, setResults] = useState<FloorPlanResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (data: typeof formData) => {
    setFormData(data)
    setState("loading")
    setError(null)

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, num_results: 6 }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Generation failed')
      }

      if (!responseData.success) {
        throw new Error(responseData.error || 'Request was not successful')
      }

      setResults(responseData.results)
      
      // Show success toast
      const summary = responseData.summary
      toast({
        title: "Floor plans generated!",
        description: `Found ${summary.returned} matches from ${summary.total_candidates} candidates.`,
      })

      setState("result")
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || 'An unexpected error occurred')
      
      toast({
        title: "Generation failed",
        description: error.message || 'Please try again',
        variant: "destructive",
      })
      
      setState("input")
    }
  }

  const handleReset = () => {
    setState("input")
    setResults([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 text-amber-950 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      <ThemeToggle />
      <HeroSection />

      <main className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        {/* Stats Dashboard - Only show on input state */}
        {state === "input" && <StatsDashboard />}

        <AnimatePresence mode="wait">
          {state === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <InputPanel onSubmit={handleSubmit} />
            </motion.div>
          )}

          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {state === "result" && results.length > 0 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsGrid 
                results={results}
                onReset={handleReset}
                formData={formData}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  )
}
