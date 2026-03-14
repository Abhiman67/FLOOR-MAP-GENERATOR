"use client"

import { motion } from "framer-motion"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VastuBadgeProps {
  score: number
  complianceLevel: string
  emoji: string
  details?: Array<{
    aspect: string
    direction: string
    status: string
    score: number
    message: string
  }>
  recommendations?: string[]
}

export default function VastuBadge({ 
  score, 
  complianceLevel, 
  emoji, 
  details = [],
  recommendations = []
}: VastuBadgeProps) {
  const getColor = () => {
    if (score >= 85) return "bg-green-100 text-green-800 border-green-300"
    if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-300"
    if (score >= 50) return "bg-orange-100 text-orange-800 border-orange-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-help ${getColor()}`}
          >
            <span>{emoji}</span>
            <span>Vastu: {score}%</span>
            <Info className="w-3 h-3 opacity-70" />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 bg-white dark:bg-gray-800 border shadow-lg">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b pb-2">
              {complianceLevel}
            </div>
            
            {details.length > 0 && (
              <div className="space-y-1.5">
                {details.map((detail, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-medium">{detail.aspect}:</span>{" "}
                    <span className={
                      detail.status === "Excellent" ? "text-green-600" :
                      detail.status === "Good" ? "text-yellow-600" :
                      detail.status === "Poor" ? "text-red-600" :
                      "text-gray-600"
                    }>
                      {detail.direction} ({detail.status})
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {recommendations.length > 0 && (
              <div className="mt-3 pt-2 border-t">
                <div className="font-medium text-xs mb-1">Recommendations:</div>
                <ul className="text-xs space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                  {recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
