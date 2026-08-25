"use client"

import type { SupportType, MentorshipStyle } from '@/lib/intake/types'

const SUPPORT_TYPES: SupportType[] = [
  'Career Guidance',
  'Psycho-Social Support',
  'Technical Skills',
  'Networking',
]

const MAX_SUPPORT_TYPES = 2

interface MentorshipStyleOption {
  value: MentorshipStyle
  description: string
}

const MENTORSHIP_STYLE_OPTIONS: MentorshipStyleOption[] = [
  {
    value: 'Strict',
    description: 'Structured sessions, homework, clear accountability',
  },
  {
    value: 'Supportive',
    description: 'Open-ended, mentee-led, flexible pace',
  },
  {
    value: 'Mixed',
    description: 'Blend of both depending on the week',
  },
]

interface StepThreeProps {
  supportTypes: SupportType[]
  preferredMentorshipStyle: MentorshipStyle | null
  onChange: (field: 'supportTypes' | 'preferredMentorshipStyle', value: SupportType[] | MentorshipStyle) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export default function StepThree({
  supportTypes,
  preferredMentorshipStyle,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
}: StepThreeProps) {
  const maxSupportTypesReached = supportTypes.length >= MAX_SUPPORT_TYPES
  const canSubmit = supportTypes.length > 0 && preferredMentorshipStyle !== null && !isSubmitting

  function handleSupportTypeToggle(type: SupportType) {
    const isSelected = supportTypes.includes(type)
    if (isSelected) {
      onChange('supportTypes', supportTypes.filter((t) => t !== type))
    } else {
      if (maxSupportTypesReached) return
      onChange('supportTypes', [...supportTypes, type])
    }
  }

  return (
    <section className="flex flex-col gap-8">
      {/* Support Types */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
          What kind of support do you need?{' '}
          <span className="font-normal text-foreground-muted text-xs">(pick up to 2)</span>
        </p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="What kind of support do you need?">
          {SUPPORT_TYPES.map((type) => {
            const isSelected = supportTypes.includes(type)
            const isDisabled = !isSelected && maxSupportTypesReached
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSupportTypeToggle(type)}
                aria-pressed={isSelected}
                disabled={isDisabled}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isDisabled
                    ? 'opacity-40 cursor-not-allowed border border-border bg-[var(--surface-2)] text-foreground-muted'
                    : isSelected
                      ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-white shadow-sm font-semibold cursor-pointer'
                      : 'border border-border bg-background text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--surface-1)] cursor-pointer'
                  }
                `}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mentorship Style */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
          How do you want to be mentored?
        </p>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="How do you want to be mentored?">
          {MENTORSHIP_STYLE_OPTIONS.map(({ value, description }) => {
            const isSelected = preferredMentorshipStyle === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange('preferredMentorshipStyle', value)}
                className={`
                  w-full text-left px-5 py-4 rounded-md transition-all cursor-pointer
                  ${isSelected
                    ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green-soft)] text-foreground font-semibold shadow-sm'
                    : 'border border-border bg-background text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--surface-1)]'
                  }
                `}
              >
                <span className="block font-semibold text-sm text-foreground">{value}</span>
                <span className="block text-xs mt-0.5 text-foreground-muted font-normal">{description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-medium border border-border bg-background text-foreground hover:bg-[var(--surface-1)] transition-all cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`
            inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all
            ${canSubmit
              ? 'bg-[var(--brand-green)] text-white hover:opacity-90 shadow-sm cursor-pointer'
              : 'bg-[var(--surface-3)] text-[var(--foreground-subtle)] cursor-not-allowed opacity-60'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
              Submitting…
            </>
          ) : (
            'Complete Profile →'
          )}
        </button>
      </div>
    </section>
  )
}
