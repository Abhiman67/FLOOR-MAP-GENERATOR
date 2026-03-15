"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import {
  Search,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Brain,
  Compass,
  ImageIcon,
  Database,
  Wand2,
  ScanLine,
  Home,
  Layers,
  Zap,
  CheckCircle2,
  Star,
  Clock3,
  BadgeCheck,
  Rocket,
  Mail,
  Github,
} from "lucide-react"

/* ──────────── Animated Counter ──────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const step = Math.ceil(target / (duration / 16))
    const interval = setInterval(() => {
      start += step
      if (start >= target) {
        start = target
        clearInterval(interval)
      }
      setCount(start)
    }, 16)
    return () => clearInterval(interval)
  }, [inView, target])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

/* ──────────── Feature Card ──────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  borderColor,
  delay,
}: {
  icon: any
  title: string
  description: string
  gradient: string
  borderColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white dark:bg-gray-800/90 border ${borderColor} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default`}
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 rounded-2xl ${gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none`} />

      <div
        className={`w-11 h-11 rounded-xl ${gradient} flex items-center justify-center mb-4 shadow-sm`}
      >
        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-[1.6]">{description}</p>
    </motion.div>
  )
}

/* ──────────── Step Card ──────────── */
function StepCard({
  number,
  title,
  description,
  icon: Icon,
  delay,
}: {
  number: string
  title: string
  description: string
  icon: any
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative text-center group"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
            <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-600 shadow-sm">
            {number}
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-[1.6] max-w-60 mx-auto">{description}</p>
    </motion.div>
  )
}

/* ──────────── Highlight Bullet ──────────── */
function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-[13px] text-gray-600 dark:text-gray-400">
      <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14"
    >
      <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-[11px] font-semibold text-amber-600 dark:text-amber-400 tracking-widest uppercase rounded-md border border-amber-200/60 dark:border-amber-800/30 mb-4">
        {kicker}
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════════ */

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60])

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed left-4 top-4 z-100 rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
      >
        Skip to content
      </a>
      <ThemeToggle />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-[#FDFBF7]/80 dark:bg-gray-950/80 border-b border-gray-200/60 dark:border-gray-800/60"
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Home className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 tracking-tight">
              FloorPlanGen
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
              v3
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Features</a>
            <a href="#workflow" className="px-3 py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Workflow</a>
            <a href="#faq" className="px-3 py-1.5 text-[13px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/generator"
              className="hidden sm:inline-flex items-center text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-3 py-1.5"
            >
              Open Workspace
            </Link>
            <Link
              href="/generator"
              className="group flex items-center gap-1.5 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium text-[13px] rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-sm"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <main id="main-content">
      <section ref={heroRef} className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6 overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(120,80,20,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(120,80,20,0.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Warm radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 bg-linear-to-b from-amber-200/30 via-orange-100/20 to-transparent dark:from-amber-800/10 dark:via-transparent rounded-full blur-[100px] pointer-events-none" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/40 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 tracking-wide uppercase">
              AI-Powered Architecture
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight leading-[1.15] mb-5"
          >
            <span className="text-gray-900 dark:text-white">Discover Your </span>
            <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Perfect Floor Plan
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">in Seconds</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Ship faster with an architecture discovery platform that combines
            <strong className="text-gray-700 dark:text-gray-300 font-medium"> semantic search, Vastu intelligence, AI generation, and visual recognition</strong>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/generator"
              className="group flex items-center gap-2.5 px-7 py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-400/25 dark:shadow-amber-900/30 hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              Start Exploring
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/generator"
              className="flex items-center gap-2.5 px-7 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
            >
              <Wand2 className="w-4 h-4 text-purple-500" />
              AI Generate
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-6 mt-10 text-[12px] text-gray-400 dark:text-gray-500"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>Free & Open Source</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span>No Sign-up Required</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Production-ready core</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 2640, suffix: "+", label: "Floor Plans", sub: "curated dataset" },
              { value: 12, suffix: "+", label: "Endpoints", sub: "production APIs" },
              { value: 6, suffix: "", label: "AI Pipelines", sub: "integrated" },
              { value: 99, suffix: "%", label: "Uptime Goal", sub: "target SLA" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionTitle
            kicker="Capabilities"
            title="Powerful Tools for Every Stage"
            description="From exploration to generation and recognition, the platform is designed as a full-stack architectural workflow."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Brain}
              title="Semantic AI Search"
              description="Describe your dream home in plain English. Our AI understands meaning, not just keywords."
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              borderColor="border-amber-100 dark:border-gray-700/60"
              delay={0}
            />
            <FeatureCard
              icon={Compass}
              title="Vastu Compliance"
              description="Every plan scored for Vastu Shastra principles. Filter by compliance level for harmonious design."
              gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
              borderColor="border-emerald-100 dark:border-gray-700/60"
              delay={0.06}
            />
            <FeatureCard
              icon={ImageIcon}
              title="Reverse Image Search"
              description="Upload any floor plan image to find visually similar plans from our database instantly."
              gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
              borderColor="border-blue-100 dark:border-gray-700/60"
              delay={0.12}
            />
            <FeatureCard
              icon={Database}
              title="2,640+ Floor Plans"
              description="Browse a large curated dataset. Filter by square footage, bedrooms, bathrooms, and garage size."
              gradient="bg-gradient-to-br from-violet-400 to-purple-500"
              borderColor="border-violet-100 dark:border-gray-700/60"
              delay={0.18}
            />
            <FeatureCard
              icon={Wand2}
              title="AI Plan Generation"
              description="Generate custom floor plans from text prompts or hand-drawn sketches using AI models."
              gradient="bg-gradient-to-br from-pink-400 to-rose-500"
              borderColor="border-pink-100 dark:border-gray-700/60"
              delay={0.24}
            />
            <FeatureCard
              icon={ScanLine}
              title="Plan Recognition"
              description="Upload a floor plan image — AI extracts rooms, walls, doors, and windows automatically."
              gradient="bg-gradient-to-br from-orange-400 to-red-500"
              borderColor="border-orange-100 dark:border-gray-700/60"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="workflow" className="py-20 md:py-24 px-6 bg-linear-to-b from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-950 border-y border-gray-100 dark:border-gray-800/40">
        <div className="max-w-4xl mx-auto">
          <SectionTitle
            kicker="Workflow"
            title="Three Steps to Production-Ready Plans"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-linear-to-r from-amber-200 via-orange-200 to-amber-200 dark:from-amber-800/40 dark:via-orange-800/40 dark:to-amber-800/40" />

            <StepCard
              number="1"
              title="Describe or Search"
              description="Type in natural language, upload an image, or use traditional filters to find plans."
              icon={Search}
              delay={0}
            />
            <StepCard
              number="2"
              title="Explore & Compare"
              description="Browse AI-ranked results with Vastu scores, find similar plans, and save favorites."
              icon={Layers}
              delay={0.1}
            />
            <StepCard
              number="3"
              title="Choose & Use"
              description="Pick your plan with full details — layout, dimensions, compliance info, and more."
              icon={Zap}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── Product Standards ─── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: "Consistent Quality",
              text: "Every result includes model confidence, metadata, and ranking signals for transparent decisions.",
            },
            {
              icon: Clock3,
              title: "Fast Iteration",
              text: "Run search, generation, and visual analysis in one workspace without changing tools.",
            },
            {
              icon: BadgeCheck,
              title: "Enterprise Friendly",
              text: "Built on typed APIs, modular components, and scalable architecture for real production teams.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 p-6"
            >
              <item.icon className="w-5 h-5 text-amber-500 mb-3" />
              <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
              <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Highlights + CTA ─── */}
      <section className="py-20 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left — highlights */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-[11px] font-semibold text-amber-600 dark:text-amber-400 tracking-widest uppercase rounded-md border border-amber-200/60 dark:border-amber-800/30 mb-4">
                Why Choose Us
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-6 leading-snug">
                Built for Architects,<br />
                Designers & Homeowners
              </h2>
              <div className="space-y-3.5">
                <Highlight>Natural language search — just describe what you want</Highlight>
                <Highlight>Vastu Shastra compliance analysis on every plan</Highlight>
                <Highlight>AI-powered visual similarity matching</Highlight>
                <Highlight>Generate plans from text prompts or sketches</Highlight>
                <Highlight>Upload & instantly recognize room structures</Highlight>
                <Highlight>Free, open-source, no account required</Highlight>
              </div>
            </motion.div>

            {/* Right — CTA card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative bg-linear-to-br from-amber-500 to-orange-500 rounded-2xl p-10 text-center shadow-xl overflow-hidden">
                {/* Background circles */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ready to Launch?
                  </h3>
                  <p className="text-sm text-white/80 mb-6 leading-relaxed max-w-70 mx-auto">
                    Enter the full generator workspace and start building your next concept in minutes.
                  </p>
                  <Link
                    href="/generator"
                    className="group inline-flex items-center gap-2.5 px-7 py-3 bg-white text-amber-700 font-semibold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                  >
                    Start Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 px-6 border-t border-gray-100 dark:border-gray-800/40">
        <div className="max-w-3xl mx-auto">
          <SectionTitle
            kicker="FAQ"
            title="Questions Teams Ask Before Adopting"
            description="Clear answers for architecture studios, builders, and product teams evaluating the platform."
          />

          <div className="space-y-3">
            {[
              {
                q: "Can we use this in a production workflow?",
                a: "Yes. The app now has modular frontend architecture, typed API contracts, and multiple AI modes suitable for real project pipelines.",
              },
              {
                q: "Is this only for AI generation?",
                a: "No. You can search existing plans, analyze uploaded drawings, run reverse visual search, and then generate new variants.",
              },
              {
                q: "Do we need an account to start?",
                a: "No account is required to start exploring. You can use the workspace immediately and extend auth later for team collaboration.",
              },
              {
                q: "What makes the results trustworthy?",
                a: "Each result includes ranking metadata, feature-level details, and optional Vastu scoring so decisions are explainable, not black-box.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-10 px-6 border-t border-gray-100 dark:border-gray-800/40 bg-white/50 dark:bg-gray-950/60">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400">
            <Home className="w-3.5 h-3.5" />
              <span>FloorPlanGen v3.2</span>
            </div>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 max-w-sm">
              Modern floor plan intelligence platform combining search, generation, recognition, and compliance analysis.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            <Link href="/generator" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Workspace
            </Link>
            <a href="#features" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#faq" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <Mail className="w-4 h-4" />
            <Github className="w-4 h-4" />
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
