"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface InputPanelProps {
  onSubmit: (data: {
    sq_ft: number
    bedrooms: number
    bathrooms: number
    garage: number
  }) => void
}

export default function InputPanel({ onSubmit }: InputPanelProps) {
  const [sqFt, setSqFt] = useState(2500)
  const [bedrooms, setBedrooms] = useState(3)
  const [bathrooms, setBathrooms] = useState(2)
  const [garage, setGarage] = useState(2)

  const handleSubmit = () => {
    onSubmit({ sq_ft: sqFt, bedrooms, bathrooms, garage })
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
