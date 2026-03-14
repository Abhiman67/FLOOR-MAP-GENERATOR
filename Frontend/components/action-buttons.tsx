"use client"

import { motion } from "framer-motion"
import { Heart, Download, Eye, Shuffle } from "lucide-react"
import { useState } from "react"

interface FavoritesButtonProps {
  filename: string
  isFavorite: boolean
  onToggleFavorite: (filename: string) => void
}

export function FavoriteButton({ filename, isFavorite, onToggleFavorite }: FavoritesButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onToggleFavorite(filename)}
      className={`p-2 rounded-full transition-colors ${
        isFavorite 
          ? "bg-red-100 text-red-600" 
          : "bg-gray-100 text-gray-400 hover:text-red-500"
      }`}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
    </motion.button>
  )
}

interface FindSimilarButtonProps {
  filename: string
  onFindSimilar: (filename: string) => void
}

export function FindSimilarButton({ filename, onFindSimilar }: FindSimilarButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onFindSimilar(filename)}
      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-colors"
    >
      <Shuffle className="w-4 h-4" />
      Find Similar
    </motion.button>
  )
}

interface ActionButtonsProps {
  filename: string
  isFavorite: boolean
  onToggleFavorite: (filename: string) => void
  onFindSimilar: (filename: string) => void
  onView: () => void
  onDownload: () => void
}

export default function ActionButtons({
  filename,
  isFavorite,
  onToggleFavorite,
  onFindSimilar,
  onView,
  onDownload
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <FavoriteButton 
        filename={filename}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
      
      <button
        onClick={onView}
        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
      
      <button
        onClick={onDownload}
        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Save
      </button>
    </div>
  )
}
