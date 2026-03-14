"use client"

import { motion } from "framer-motion"
import { Download, Eye } from "lucide-react"
import { useState } from "react"
import VastuBadge from "@/components/vastu-badge"

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

interface ResultsGridProps {
  results: FloorPlanResult[]
  onReset: () => void
  formData: {
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
  }
}

export default function ResultsGrid({ results, onReset, formData }: ResultsGridProps) {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlanResult | null>(null)

  const getMatchQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-300'
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'fair': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const handleDownload = async (result: FloorPlanResult) => {
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary Header */}
      <div className="mb-6 bg-white/60 backdrop-blur-md border border-amber-200 rounded-lg p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-2">
            Found {results.length} Floor Plans
          </h2>
          <p className="text-amber-700">
            Matching {formData.bedrooms} bed, {formData.bathrooms} bath, ~{formData.sq_ft.toLocaleString()} sqft
          </p>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {results.map((result, index) => (
          <motion.div
            key={result.details.filename}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative bg-white/60 backdrop-blur-md border border-amber-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all group"
          >
            {/* Match Quality Badge */}
            <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold border ${getMatchQualityColor(result.metadata.match_quality)}`}>
              {result.metadata.match_quality}
            </div>

            {/* Rank Badge */}
            {result.metadata.rank <= 3 && (
              <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                #{result.metadata.rank}
              </div>
            )}

            {/* Image */}
            <div className="relative aspect-video bg-gray-100 cursor-pointer" onClick={() => setSelectedPlan(result)}>
              <img
                src={result.image_url}
                alt={`Floor plan ${result.details.sq_ft} sqft`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Details */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-lg font-bold text-amber-900">{result.details.sq_ft.toLocaleString()}</p>
                  <p className="text-xs text-amber-700">sqft</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-900">{result.details.bedrooms} / {result.details.bathrooms}</p>
                  <p className="text-xs text-amber-700">bed/bath</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-900">{result.details.garage}</p>
                  <p className="text-xs text-amber-700">garage</p>
                </div>
              </div>

              {/* Vastu Badge */}
              {result.vastu && (
                <div className="flex justify-center mb-3">
                  <VastuBadge
                    score={result.vastu.score}
                    complianceLevel={result.vastu.compliance_level}
                    emoji={result.vastu.emoji}
                    details={result.vastu.details}
                    recommendations={result.vastu.recommendations}
                  />
                </div>
              )}

              {/* Size Difference */}
              {result.metadata.sq_ft_difference > 0 && (
                <p className="text-xs text-center text-amber-600 mb-3">
                  {result.metadata.sq_ft_difference} sqft difference
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPlan(result)}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(result)}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <motion.button
          onClick={onReset}
          className="px-8 py-3 bg-white border border-amber-300 text-amber-950 font-semibold text-sm rounded-lg hover:bg-amber-50 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← New Search
        </motion.button>
      </div>

      {/* Full View Modal */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedPlan.details.sq_ft.toLocaleString()} sqft Floor Plan
                </h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <img
                src={selectedPlan.image_url}
                alt="Floor plan full view"
                className="w-full h-auto rounded-lg mb-4"
              />

              <div className="grid grid-cols-4 gap-4 text-center mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold text-gray-900">{selectedPlan.details.sq_ft.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Square Feet</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold text-gray-900">{selectedPlan.details.bedrooms}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold text-gray-900">{selectedPlan.details.bathrooms}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-2xl font-bold text-gray-900">{selectedPlan.details.garage}</p>
                  <p className="text-sm text-gray-600">Garage Spaces</p>
                </div>
              </div>

              {/* Vastu Information */}
              {selectedPlan.vastu && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Vastu Analysis</h4>
                    <VastuBadge
                      score={selectedPlan.vastu.score}
                      complianceLevel={selectedPlan.vastu.compliance_level}
                      emoji={selectedPlan.vastu.emoji}
                      details={selectedPlan.vastu.details}
                      recommendations={selectedPlan.vastu.recommendations}
                    />
                  </div>
                  {selectedPlan.vastu.recommendations && selectedPlan.vastu.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        {selectedPlan.vastu.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleDownload(selectedPlan)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              >
                Download Floor Plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
