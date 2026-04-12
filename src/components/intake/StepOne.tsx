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
        <p className="font-semibold text-[var(--md-on-surface)]">
          How often do you feel in control of your situation?
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="How often do you feel in control of your situation?">
          {Q1_OPTIONS.map((option) => {
            const isSelected = q1 === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange('q1', option)}
                aria-pressed={isSelected}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors cursor-pointer
                  ${isSelected
                    ? 'bg-[var(--md-primary)] border-[var(--md-primary)] text-white'
                    : 'bg-transparent border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)]'
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
        <p className="font-semibold text-[var(--md-on-surface)]">
          How well are you managing pressure and stress right now?
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="How well are you managing pressure and stress right now?">
          {Q2_OPTIONS.map((option) => {
            const isSelected = q2 === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange('q2', option)}
                aria-pressed={isSelected}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors cursor-pointer
                  ${isSelected
                    ? 'bg-[var(--md-primary)] border-[var(--md-primary)] text-white'
                    : 'bg-transparent border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)]'
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
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`
            px-6 py-2.5 rounded-full text-sm font-semibold transition-colors
            ${canProceed
              ? 'bg-[var(--md-primary)] text-white hover:opacity-90 cursor-pointer'
              : 'bg-[var(--md-outline-variant)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
            }
          `}
        >
          Next →
        </button>
      </div>
    </section>
  )
}
