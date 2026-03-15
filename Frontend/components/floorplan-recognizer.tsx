"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, ScanLine, Search, Loader2 } from "lucide-react"

interface FloorplanRecognizerProps {
    onRecognize: (data: { image: File }) => void
    onSearch: (data: { image: File }) => void
    isLoading?: boolean
}

export default function FloorplanRecognizer({ onRecognize, onSearch, isLoading = false }: FloorplanRecognizerProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleReset = () => {
        setFile(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-blue-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300 p-6 md:p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    AI Floor Plan Analysis
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Upload any floor plan to instantly extract dimensions and find similar designs.
                </p>
            </div>

            <div className="space-y-6">
                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl transition-colors ${preview
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                        }`}
                    onClick={() => !preview && fileInputRef.current?.click()}
                >
                    {preview ? (
                        <div className="p-4 relative">
                            <div className="aspect-video w-full max-w-lg mx-auto relative rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                                <img src={preview} alt="Uploaded plan" className="w-full h-full object-contain bg-white dark:bg-gray-900" />

                                {isLoading && (
                                    <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm flex flex-col items-center justify-center">
                                        <ScanLine className="w-12 h-12 text-blue-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                                        <div className="w-full max-w-xs h-1 bg-blue-200/50 mt-4 rounded overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-[translateX_2s_infinite]" style={{ width: '40%' }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isLoading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                    className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="py-16 px-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                PNG, JPG or PDF (Max 10MB)
                            </p>
                        </div>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Action Buttons */}
                <AnimatePresence>
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                        >
                            <button
                                onClick={() => onRecognize({ image: file! })}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold py-4 px-6 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />}
                                Extract Dimensions & Rooms
                            </button>

                            <button
                                onClick={() => onSearch({ image: file! })}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                Find Similar Designs
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}
