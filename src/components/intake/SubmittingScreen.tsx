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
  const [visibleLines, setVisibleLines] = useState<number>(2)

  useEffect(() => {
    if (!visible) {
      setVisibleLines(2)
      return
    }

    const t1 = setTimeout(() => setVisibleLines(3), 1000)
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
      <div
        className="rounded-lg border border-border bg-background p-8 min-w-[320px] max-w-sm"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="mb-6 text-center">
          <div
            className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3"
            style={{ borderColor: "var(--brand-green)", borderTopColor: "transparent" }}
          />
          <h2 className="text-label text-foreground">Submitting</h2>
        </div>

        <ul className="space-y-3">
          {STATUS_LINES.map((line, index) => {
            const isVisible = index < visibleLines
            const iconColor =
              line.icon === "✓"
                ? "var(--brand-green)"
                : line.icon === "⟳"
                  ? "var(--brand-green)"
                  : "var(--foreground-muted)"
            return (
              <li
                key={index}
                className={`flex items-center gap-3 text-body-sm transition-all duration-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                aria-hidden={!isVisible}
              >
                <span className="shrink-0 font-medium" style={{ color: iconColor }}>
                  {line.icon}
                </span>
                <span className="text-foreground-muted">{line.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
