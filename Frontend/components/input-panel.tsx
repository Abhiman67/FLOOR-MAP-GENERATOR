"use client"

import { useState } from "react"
import{ motion } from "framer-motion"
import { Info } from "lucide-react"

interface InputPanelProps {
  onSubmit: (data: {
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
    vastu_compliant?: boolean
    min_vastu_score?: number
  }) => void
}

export default function InputPanel({ onSubmit }: InputPanelProps) {
  const [sqFt, setSqFt] = useState(2500)
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [garage, setGarage] = useState(2)
  const [vastuCompliant, setVastuCompliant] = useState(false)
  const [minVastuScore, setMinVastuScore] = useState(0)
  const [showVastuOptions, setShowVastuOptions] = useState(false)

  const handleSubmit = () => {
    onSubmit({ 
      sq_ft: sqFt, 
      bedrooms, 
      bathrooms, 
      garage,
      vastu_compliant: vastuCompliant,
      min_vastu_score: minVastuScore
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div className="max-w-2xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
      <div className="relative backdrop-blur-md bg-white/60 border border-amber-200 rounded-lg p-8 shadow-lg">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-lg pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Square Footage Slider */}
          <motion.div variants={itemVariants} className="space-y-3">
            <label className="block font-semibold text-sm tracking-tight text-amber-900 uppercase">
              Square Footage
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="500"
                max="8000"
                value={sqFt}
                onChange={(e) => setSqFt(Number(e.target.value))}
                className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-amber-900">{sqFt.toLocaleString()} sq ft</span>
                <span className="font-medium text-xs text-amber-600">500 — 8000</span>
              </div>
            </div>
          </motion.div>

          {/* Bedrooms, Bathrooms, Garage Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="block font-semibold text-sm tracking-tight text-amber-900 uppercase">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm text-amber-950 font-medium hover:border-amber-300 transition-colors focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <label className="block font-semibold text-sm tracking-tight text-amber-900 uppercase">Bathrooms</label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm text-amber-950 font-medium hover:border-amber-300 transition-colors focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Garage */}
            <div className="space-y-2">
              <label className="block font-semibold text-sm tracking-tight text-amber-900 uppercase">
                Garage Capacity
              </label>
              <select
                value={garage}
                onChange={(e) => setGarage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-amber-200 rounded text-sm text-amber-950 font-medium hover:border-amber-300 transition-colors focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Vastu Filter Section */}
          <motion.div variants={itemVariants} className="border-t border-amber-200 pt-6">
            <button
              type="button"
              onClick={() => setShowVastuOptions(!showVastuOptions)}
              className="w-full flex items-center justify-between text-left mb-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🕉️</span>
                <span className="font-semibold text-sm tracking-tight text-amber-900 uppercase">
                  Vastu Shastra Filter
                </span>
                <Info className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-amber-600">
                {showVastuOptions ? "−" : "+"}
              </span>
            </button>
            
            {showVastuOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                {/* Vastu Compliant Toggle */}
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                  <div>
                    <label className="font-medium text-sm text-amber-900">
                      Vastu Compliant Only
                    </label>
                    <p className="text-xs text-amber-600">Show only plans with 70%+ Vastu score</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVastuCompliant(!vastuCompliant)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      vastuCompliant ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        vastuCompliant ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Minimum Vastu Score Slider */}
                <div className="space-y-2">
                  <label className="block font-medium text-sm text-amber-900">
                    Minimum Vastu Score: {minVastuScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minVastuScore}
                    onChange={(e) => setMinVastuScore(Number(e.target.value))}
                    className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-amber-600">
                    <span>No filter</span>
                    <span>Strict (100%)</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>About Vastu:</strong> Traditional Indian architectural science for harmonious living.
                    Higher scores indicate better compliance with directional principles.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleSubmit}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold tracking-tight text-sm uppercase rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-200/40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Generate Floor Plan
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
