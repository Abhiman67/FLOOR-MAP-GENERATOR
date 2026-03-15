"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Image as ImageIcon, Wand2, Loader2 } from "lucide-react"

interface AIGeneratorPanelProps {
    onGenerate: (data: { prompt: string, style: string }) => void
    onGenerateFromSketch: (data: { prompt: string, image: File }) => void
    isLoading?: boolean
}

export default function AIGeneratorPanel({ onGenerate, onGenerateFromSketch, isLoading = false }: AIGeneratorPanelProps) {
    const [activeTab, setActiveTab] = useState<"text" | "sketch">("text")
    const [prompt, setPrompt] = useState("")
    const [style, setStyle] = useState("modern architectural")
    const [sketchFile, setSketchFile] = useState<File | null>(null)
    const [sketchPreview, setSketchPreview] = useState<string | null>(null)

    const styles = [
        { id: "modern architectural", label: "Modern" },
        { id: "minimalist blueprint", label: "Minimalist" },
        { id: "luxury estate floor plan", label: "Luxury" },
        { id: "traditional colonial layout", label: "Traditional" },
    ]

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSketchFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setSketchPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (activeTab === "text" && prompt.trim()) {
            onGenerate({ prompt, style })
        } else if (activeTab === "sketch" && sketchFile) {
            onGenerateFromSketch({ prompt: prompt || "architectural floor plan", image: sketchFile })
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-amber-100 dark:border-gray-700 overflow-hidden transform transition-all duration-300">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "text"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-b-2 border-amber-500"
                            : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="hidden sm:inline">Text to Plan</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("sketch")}
                    className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === "sketch"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-b-2 border-amber-500"
                            : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Sketch to Plan</span>
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="space-y-6">
                    {activeTab === "sketch" && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Upload Rough Sketch
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-amber-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50">
                                <div className="space-y-1 text-center">
                                    {sketchPreview ? (
                                        <div className="relative w-full max-w-xs mx-auto">
                                            <img src={sketchPreview} alt="Sketch preview" className="rounded-lg border border-gray-200 shadow-sm" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setSketchFile(null); setSketchPreview(null); }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 focus:outline-none"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none px-2 py-1">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {activeTab === "text" ? "Describe your dream floor plan" : "Any specific requirements? (Optional)"}
                        </label>
                        <div className="relative">
                            <textarea
                                id="prompt"
                                rows={3}
                                placeholder={activeTab === "text" ? "E.g., A spacious 4-bedroom modern home with an open-concept kitchen, a large master suite, and a 3-car garage..." : "E.g., Make sure the kitchen is on the right side"}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900 transition-all resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                required={activeTab === "text"}
                            />
                        </div>
                    </div>

                    {activeTab === "text" && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Architectural Style
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {styles.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setStyle(s.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${style === s.id
                                                ? "bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/40 dark:border-amber-500 dark:text-amber-300"
                                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isLoading || (activeTab === "text" && !prompt.trim()) || (activeTab === "sketch" && !sketchFile)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>AI is Drawing... (This takes 10-30s)</span>
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>{activeTab === "text" ? "Generate AI Floor Plan" : "Transform Sketch to Plan"}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
