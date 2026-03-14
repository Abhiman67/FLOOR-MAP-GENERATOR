"use client"

import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <div className="relative py-24 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-amber-100 dark:border-gray-700 transition-colors duration-300">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(217, 119, 6, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(217, 119, 6, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-bold tracking-tight mb-2 text-amber-950 dark:text-amber-100 transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Floor-Plan-Generator
        </motion.h1>
        <motion.p
          className="text-sm tracking-widest text-amber-700 dark:text-amber-400 mb-6 font-semibold transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          V2.0
        </motion.p>
        <motion.p
          className="text-lg text-amber-800 dark:text-amber-300 font-light tracking-wide transition-colors duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Discover Perfect Floor Plans in Seconds
        </motion.p>
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-600 to-transparent w-1/2 transition-colors duration-300"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </div>
  )
}
