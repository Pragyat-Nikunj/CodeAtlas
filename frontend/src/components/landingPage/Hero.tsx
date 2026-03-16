'use client'

import Link from "next/link"
import { useAuth } from "@/providers/AuthContext"
import { Sparkles } from "lucide-react"

export default function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent blur-3xl"></div>

      <div className="relative mx-auto max-w-6xl px-6 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-xs text-indigo-300 mb-6">
          <Sparkles className="h-3 w-3" />
          AI-powered repository understanding
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Understand any
          <span className="text-indigo-400"> codebase</span>
          <br />
          in seconds
        </h1>

        <p className="mt-6 text-lg text-white max-w-2xl mx-auto">
          CodeAtlas analyzes repositories, explains architecture,
          and surfaces security signals so developers can understand
          unfamiliar projects instantly.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">

          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
            >
              Get Started
            </Link>
          )}


        </div>

      </div>
    </section>
  )
}