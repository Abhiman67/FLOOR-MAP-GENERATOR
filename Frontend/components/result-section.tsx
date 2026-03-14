"use client"

import { motion } from "framer-motion"

interface FloorPlanResult {
  image_url: string
  details: {
    filename: string
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
  }
  metadata?: {
    match_quality: string
    sq_ft_difference: number
    result_number: number
    total_candidates: number
  }
}

interface ResultSectionProps {
  result: FloorPlanResult
  onReset: () => void
  onGenerateAgain: () => void
  formData: {
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
  }
}

export default function ResultSection({ result, onReset, onGenerateAgain, formData }: ResultSectionProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(result.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `floor-plan-${result.details.sq_ft}sqft-${result.details.bedrooms}bed-${result.details.bathrooms}bath.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const getMatchQualityColor = (quality?: string) => {
    switch (quality) {4xl mx-auto">
      <div className="space-y-6">
        {/* Plan Details */}
        <div className="bg-white/60 backdrop-blur-md border border-amber-200 rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-900">{result.details.sq_ft.toLocaleString()}</p>
              <p className="text-sm text-amber-700">Square Feet</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{result.details.bedrooms}</p>
              <p className="text-sm text-amber-700">Bedrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{result.details.bathrooms}</p>
              <p className="text-sm text-amber-700">Bathrooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{result.details.garage}</p>
              <p className="text-sm text-amber-700">Garage Spaces</p>
            </div>
          </div>
          
          {/* Match Quality */}
          {result.metadata && (
            <div className="mt-4 pt-4 border-t border-amber-200 text-center">
              <p className="text-sm text-amber-700">
                <span className={`font-semibold capitalize ${getMatchQualityColor(result.metadata.match_quality)}`}>
                  {result.metadata.match_quality}
                </span> match • 
                <span className="ml-1">
                  {result.metadata.sq_ft_difference === 0 
                    ? "Exact size match!" 
                    : `${result.metadata.sq_ft_difference} sq ft difference`
                  }
                </span> • 
                <span className="ml-1">Option {result.metadata.result_number} of {result.metadata.total_candidates}</span>
              </p>
            </div>
          )}
        </div>

        {/* Image container with subtle border */}
        <div className="relative backdrop-blur-md bg-white/40 border border-amber-200 rounded-lg overflow-hidden shadow-lg aspect-video">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 pointer-events-none z-10" />

          {/* Image */}
          <div className="relative w-full h-full">
            <img
              src={result.image_url || "/placeholder.svg"}
              alt="Generated floor plan"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Border glow */}
          <div className="absolute inset-0 border border-amber-200/50 rounded-lg pointer-events-none z-20" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <motion.button
            onClick={handleDownload}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Floor Plan
          </motion.button>

          <motion.button
            onClick={onGenerateAgain}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Generate Again
          </motion.button>

          <motion.button
            onClick={onReset}
            className="px-8 py-3 bg-white border border-amber-300 text-amber-950 font-semibold text-sm rounded-lg hover:bg-amber-50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            New Search Plan
          </motion.button>

          <motion.button
            onClick={onReset}
            className="px-8 py-3 bg-white border border-amber-300 text-amber-950 font-semibold text-sm rounded-lg hover:bg-amber-50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Another
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
