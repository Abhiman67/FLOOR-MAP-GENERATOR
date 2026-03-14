"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, X } from "lucide-react"

interface SemanticSearchProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export default function SemanticSearch({ onSearch, isLoading = false }: SemanticSearchProps) {
  const [query, setQuery] = useState("")
  const [showExamples, setShowExamples] = useState(false)

  const exampleQueries = [
    "cozy 3 bedroom house with modern kitchen",
    "spacious family home with good vastu",
    "compact 2 bedroom with garage",
    "luxury home with pool and patio",
    "traditional 4 bedroom with basement",
    "minimalist single story with open concept"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleExampleClick = (example: string) => {
    setQuery(example)
    setShowExamples(false)
    onSearch(example)
  }

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative bg-white/80 backdrop-blur-md border-2 border-amber-300 rounded-full shadow-lg">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowExamples(true)}
              placeholder="Describe your dream floor plan in natural language..."
              className="w-full pl-12 pr-32 py-4 bg-transparent text-amber-950 placeholder-amber-600/60 focus:outline-none text-base"
              disabled={isLoading}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setShowExamples(false)
                  }}
                  className="p-2 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-amber-600" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Example Queries Dropdown */}
        <AnimatePresence>
          {showExamples && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden z-10"
            >
              <div className="p-3 bg-amber-50 border-b border-amber-200">
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Try these examples
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {exampleQueries.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    className="w-full px-4 py-3 text-left text-sm text-amber-900 hover:bg-amber-50 transition-colors flex items-center gap-3 border-b border-amber-100 last:border-b-0"
                  >
                    <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{example}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-center text-sm text-amber-700"
        >
          🎨 <strong>AI-Powered Search:</strong> Describe what you're looking for in plain English
        </motion.p>
      </motion.div>

      {/* Overlay to close examples when clicking outside */}
      {showExamples && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowExamples(false)}
        />
      )}
    </div>
  )
}
