"use client"

import { useState, useEffect } from "react"

interface SubmittingScreenProps {
  visible: boolean
}

const STATUS_LINES = [
  { icon: "✓", text: "Saving intake record" },
  { icon: "✓", text: "Recording resilience baseline" },
  { icon: "⟳", text: "Preparing your mentor recommendations…" },
  { icon: "→", text: "Redirecting to dashboard" },
] as const

export default function SubmittingScreen({ visible }: SubmittingScreenProps) {
  // Lines 0 and 1 are shown immediately; lines 2 and 3 are delayed
  const [visibleLines, setVisibleLines] = useState<number>(2)

  useEffect(() => {
    if (!visible) {
      setVisibleLines(2)
      return
    }

    // Line 3 (index 2) appears at 1 second
    const t1 = setTimeout(() => setVisibleLines(3), 1000)
    // Line 4 (index 3) appears at 2 seconds
    const t2 = setTimeout(() => setVisibleLines(4), 2000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Submitting your intake"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="jenga-card bg-[var(--md-surface-container-lowest)] border border-[var(--md-outline-variant)] rounded-sm p-8 min-w-[320px] max-w-sm shadow-lg">
        {/* Spinner / heading */}
        <div className="mb-6 text-center">
          <div className="inline-block w-8 h-8 border-2 border-[var(--md-primary-container)] border-t-transparent rounded-full animate-spin mb-3" />
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--md-on-surface)]">
            Submitting
          </h2>
        </div>

        {/* Status lines */}
        <ul className="space-y-3">
          {STATUS_LINES.map((line, index) => {
            const isVisible = index < visibleLines
            return (
              <li
                key={index}
                className={`flex items-center gap-3 font-mono text-sm transition-all duration-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                aria-hidden={!isVisible}
              >
                <span
                  className={`shrink-0 font-bold ${
                    line.icon === "✓"
                      ? "text-[var(--md-primary-container)]"
                      : line.icon === "⟳"
                      ? "text-[var(--md-secondary)]"
                      : "text-[var(--md-on-surface-variant)]"
                  }`}
                >
                  {line.icon}
                </span>
                <span className="text-[var(--md-on-surface-variant)]">{line.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
