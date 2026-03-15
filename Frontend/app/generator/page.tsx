"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import InputPanel from "@/components/input-panel"
import AIGeneratorPanel from "@/components/ai-generator-panel"
import FloorplanRecognizer from "@/components/floorplan-recognizer"
import LoadingState from "@/components/loading-state"
import ResultsGrid from "@/components/results-grid"
import StatsDashboard from "@/components/stats-dashboard"
import ThemeToggle from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Home, ArrowLeft, Search, Wand2, ScanLine, Sparkles, Compass } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001'

async function safeJson(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error(`Backend returned non-JSON response (HTTP ${res.status}). Is the server running?`)
  }
  return res.json()
}

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
  const [state, setState] = useState<"input" | "loading" | "result" | "ai-result" | "analyze-result">("input")
  const [activeInputTab, setActiveInputTab] = useState<"search" | "generate" | "analyze">("search")
  const [analyzeData, setAnalyzeData] = useState<any>(null)
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

  const handleSubmit = async (data: {
    sq_ft: number;
    bedrooms: number;
    bathrooms: number;
    garage: number;
    vastu_compliant?: boolean;
    min_vastu_score?: number;
  }) => {
    // Fill in default values if undefined
    const completeData = {
      sq_ft: data.sq_ft,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      garage: data.garage,
      vastu_compliant: data.vastu_compliant || false,
      min_vastu_score: data.min_vastu_score || 0,
    }
    setFormData(completeData)
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

      const responseData = await safeJson(response)

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

  const handleAIGenerate = async (data: { prompt: string, style: string }) => {
    setState("loading")
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/generate/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const responseData = await safeJson(response)

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'AI Generation failed')
      }

      setResults([responseData]) // Format to match results grid if possible or handle differently

      toast({
        title: "AI Floor plan generated!",
        description: "Your custom floor plan is ready.",
      })
      setState("ai-result")
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || 'An unexpected error occurred')
      toast({ title: "Generation failed", description: error.message, variant: "destructive" })
      setState("input")
    }
  }

  const handleAISketchGenerate = async (data: { prompt: string, image: File }) => {
    setState("loading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("prompt", data.prompt)
      formData.append("image", data.image)

      const response = await fetch(`${API_URL}/api/generate/from-sketch`, {
        method: "POST",
        body: formData,
      })

      const responseData = await safeJson(response)

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'AI Generation failed')
      }

      setResults([responseData])

      toast({
        title: "AI Floor plan generated!",
        description: "Your sketch was transformed successfully.",
      })
      setState("ai-result")
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || 'An unexpected error occurred')
      toast({ title: "Generation failed", description: error.message, variant: "destructive" })
      setState("input")
    }
  }

  const handleAIRecognize = async (data: { image: File }) => {
    setState("loading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", data.image)

      const response = await fetch(`${API_URL}/api/upload/recognize`, {
        method: "POST",
        body: formData,
      })

      const responseData = await safeJson(response)

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'AI Recognition failed')
      }

      setAnalyzeData(responseData)
      setState("analyze-result")
      toast({ title: "Analysis Complete", description: "Floor plan structure extracted." })
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || 'An unexpected error occurred')
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" })
      setState("input")
    }
  }

  const handleAISearch = async (data: { image: File }) => {
    setState("loading")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", data.image)

      const response = await fetch(`${API_URL}/api/search/image`, {
        method: "POST",
        body: formData,
      })

      const responseData = await safeJson(response)

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Reverse Image Search failed')
      }

      setResults(responseData.results)
      setState("result")
      toast({ title: "Search Complete", description: `Found ${responseData.results.length} similar plans.` })
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || 'An unexpected error occurred')
      toast({ title: "Search failed", description: error.message, variant: "destructive" })
      setState("input")
    }
  }

  const handleReset = () => {
    setState("input")
    setResults([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 text-amber-950 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      <ThemeToggle />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FDFBF7]/75 dark:bg-gray-950/75 border-b border-gray-200/60 dark:border-gray-800/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-sm font-semibold">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-gray-900 dark:text-gray-100">Generator Workspace</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Multi-Mode
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <Compass className="w-3.5 h-3.5 text-teal-500" /> Vastu Insights
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-amber-100 dark:border-gray-800 bg-white/65 dark:bg-gray-900/75 backdrop-blur-md p-6 md:p-8 shadow-sm"
          >
            <p className="text-[11px] uppercase tracking-widest font-semibold text-amber-600 dark:text-amber-400 mb-3">Production Workspace</p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Design, Generate, and Analyze in One Place</h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              Switch between semantic database search, AI generation from prompts/sketches, and visual recognition workflows.
              Built for architects, studios, and real estate product teams.
            </p>
          </motion.div>
        </section>

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
              className="space-y-8"
            >
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-3xl bg-white/90 dark:bg-gray-900/90 p-1.5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setActiveInputTab("search")}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeInputTab === "search"
                      ? "bg-amber-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-amber-500 hover:bg-amber-50/70 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Search className="w-4 h-4" />
                    Search Database
                  </button>
                  <button
                    onClick={() => setActiveInputTab("generate")}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeInputTab === "generate"
                      ? "bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-500 hover:bg-purple-50/70 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>AI Generate</span>
                  </button>
                  <button
                    onClick={() => setActiveInputTab("analyze")}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeInputTab === "analyze"
                      ? "bg-linear-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-blue-50/70 dark:hover:bg-gray-800"
                      }`}
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>AI Analyze</span>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Upload</span>
                  </button>
                </div>
              </div>

              {activeInputTab === "search" ? (
                <InputPanel onSubmit={handleSubmit} />
              ) : activeInputTab === "generate" ? (
                <AIGeneratorPanel
                  onGenerate={handleAIGenerate}
                  onGenerateFromSketch={handleAISketchGenerate}
                  isLoading={state as any === "loading"}
                />
              ) : (
                <FloorplanRecognizer
                  onRecognize={handleAIRecognize}
                  onSearch={handleAISearch}
                  isLoading={state as any === "loading"}
                />
              )}
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

          {state === "ai-result" && results.length > 0 && (
            <motion.div
              key="ai-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Generated Floor Plan</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Create Another
                </button>
              </div>
              <div className="aspect-4/3 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-gray-700">
                <img src={results[0].image_url} alt="AI Generated Floor Plan" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          )}

          {state === "analyze-result" && analyzeData && (
            <motion.div
              key="analyze-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Analysis Results (Simulation Mode)</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  Analyze Another
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Structure Detected</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyzeData.rooms?.length || 0}</div>
                      <div className="text-sm text-gray-500">Rooms</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyzeData.walls?.length || 0}</div>
                      <div className="text-sm text-gray-500">Walls</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyzeData.doors?.length || 0}</div>
                      <div className="text-sm text-gray-500">Doors</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyzeData.windows?.length || 0}</div>
                      <div className="text-sm text-gray-500">Windows</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                  <h3 className="font-semibold mb-3">Room Details</h3>
                  <ul className="space-y-2">
                    {analyzeData.rooms?.map((room: any, idx: number) => (
                      <li key={idx} className="flex justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <span className="font-medium">{room.name || room.type || `Room ${idx + 1}`}</span>
                        {room.dimensions && <span className="text-gray-500 font-mono text-sm">{room.dimensions}</span>}
                      </li>
                    ))}
                  </ul>
                  {(!analyzeData.rooms || analyzeData.rooms.length === 0) && (
                    <p className="text-gray-500 text-sm">No rooms detected.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}


        </AnimatePresence>
      </main>

      {/* Error display */}
      {
        error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )
      }
    </div >
  )
}
