"use client"

import type { Q1Response, Q2Response } from '@/lib/intake/types'

interface StepOneProps {
  q1: Q1Response | null
  q2: Q2Response | null
  onChange: (field: 'q1' | 'q2', value: Q1Response | Q2Response) => void
  onNext: () => void
}

const Q1_OPTIONS: Q1Response[] = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
const Q2_OPTIONS: Q2Response[] = ['Barely coping', 'Struggling', 'Managing', 'Thriving']

export default function StepOne({ q1, q2, onChange, onNext }: StepOneProps) {
  const canProceed = q1 !== null && q2 !== null

  return (
    <section className="flex flex-col gap-8">
      {/* Question 1 */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
          How often do you feel in control of your situation?
        </p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="How often do you feel in control of your situation?">
          {Q1_OPTIONS.map((option) => {
            const isSelected = q1 === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange('q1', option)}
                aria-pressed={isSelected}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${isSelected
                    ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-white shadow-sm font-semibold'
                    : 'border border-border bg-background text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--surface-1)]'
                  }
                `}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Question 2 */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
          How well are you managing pressure and stress right now?
        </p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="How well are you managing pressure and stress right now?">
          {Q2_OPTIONS.map((option) => {
            const isSelected = q2 === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange('q2', option)}
                aria-pressed={isSelected}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${isSelected
                    ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-white shadow-sm font-semibold'
                    : 'border border-border bg-background text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--surface-1)]'
                  }
                `}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`
            inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all
            ${canProceed
              ? 'bg-[var(--brand-green)] text-white hover:opacity-90 shadow-sm cursor-pointer'
              : 'bg-[var(--surface-3)] text-[var(--foreground-subtle)] cursor-not-allowed opacity-60'
            }
          `}
        >
          Next →
        </button>
      </div>
    </section>
  )
}
