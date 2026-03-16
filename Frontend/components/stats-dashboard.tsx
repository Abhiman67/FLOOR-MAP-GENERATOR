"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Activity, Home, Bath, Car, TrendingUp } from "lucide-react"

interface DatasetStats {
  total_plans: number
  bedroom_distribution: Record<string, number>
  bathroom_distribution: Record<string, number>
  garage_distribution: Record<string, number>
  sq_ft_range: {
    min: number
    max: number
    avg: number
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'

export default function StatsDashboard() {
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then(res => {
        if (!res.headers.get('content-type')?.includes('application/json')) {
          throw new Error(`Backend unavailable (HTTP ${res.status})`)
        }
        return res.json()
      })
      .then(data => {
        if (data.success) {
          setStats(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to load stats:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-md border border-amber-200 rounded-lg p-6 shadow-lg">
        <p className="text-center text-amber-700">Loading statistics...</p>
      </div>
    )
  }

  if (!stats) return null

  const getMostCommon = (distribution: Record<string, number>) => {
    const entries = Object.entries(distribution)
    if (entries.length === 0) return "N/A"
    const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
    return max[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/40 backdrop-blur-md border border-amber-200 rounded-lg p-6 shadow-lg mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-900">Dataset Insights</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Plans */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-4 text-center border border-amber-200">
          <div className="flex justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.total_plans.toLocaleString()}</p>
          <p className="text-xs text-amber-700 mt-1">Total Plans</p>
        </div>

        {/* Bedrooms */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="flex justify-center mb-2">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{getMostCommon(stats.bedroom_distribution)}</p>
          <p className="text-xs text-blue-700 mt-1">Most Common Beds</p>
        </div>

        {/* Bathrooms */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-200">
          <div className="flex justify-center mb-2">
            <Bath className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{getMostCommon(stats.bathroom_distribution)}</p>
          <p className="text-xs text-purple-700 mt-1">Most Common Baths</p>
        </div>

        {/* Garage */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
          <div className="flex justify-center mb-2">
            <Car className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{getMostCommon(stats.garage_distribution)}</p>
          <p className="text-xs text-green-700 mt-1">Most Common Garage</p>
        </div>

        {/* Average Size */}
        <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-4 text-center border border-orange-200">
          <div className="flex justify-center mb-2">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{Math.round(stats.sq_ft_range.avg).toLocaleString()}</p>
          <p className="text-xs text-orange-700 mt-1">Avg Sqft</p>
        </div>
      </div>

      {/* Size Range */}
      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-sm text-center text-amber-700">
          Size range: <span className="font-semibold">{stats.sq_ft_range.min.toLocaleString()}</span> - <span className="font-semibold">{stats.sq_ft_range.max.toLocaleString()}</span> sqft
        </p>
      </div>
    </motion.div>
  )
}
