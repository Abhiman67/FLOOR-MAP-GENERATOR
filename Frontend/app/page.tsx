"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HeroSection from "@/components/hero-section"
import InputPanel from "@/components/input-panel"
import LoadingState from "@/components/loading-state"
import ResultSection from "@/components/result-section"

export default function Page() {
  const [state, setState] = useState<"input" | "loading" | "result">("input")
  const [formData, setFormData] = useState({
    sq_ft: 2500,
    bedrooms: 3,
    bathrooms: 2,
    garage: 2,
  })
  const [imageUrl, setImageUrl] = useState<string>("")

  const handleSubmit = async (data: typeof formData) => {
    setFormData(data)
    setState("loading")

    try {
      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Generation failed")

      const result = await response.json()
      setImageUrl(result.image_url)

      // Simulate loading time for visual effect
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setState("result")
    } catch (error) {
      console.error("Error:", error)
      setState("input")
    }
  }

  const handleReset = () => {
    setState("input")
    setImageUrl("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 text-amber-950 overflow-hidden">
      <HeroSection />

      <main className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
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

          {state === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ResultSection imageUrl={imageUrl} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
