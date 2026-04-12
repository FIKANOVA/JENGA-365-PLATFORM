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
        <p className="font-semibold text-[var(--md-on-surface)]">
          What kind of support do you need?{' '}
          <span className="font-normal text-[var(--md-on-surface-variant)] text-xs">(pick up to 2)</span>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="What kind of support do you need?">
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
                  px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors
                  ${isDisabled
                    ? 'opacity-40 cursor-not-allowed border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)]'
                    : isSelected
                      ? 'bg-[var(--md-primary)] border-[var(--md-primary)] text-white cursor-pointer'
                      : 'bg-transparent border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)] cursor-pointer'
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
        <p className="font-semibold text-[var(--md-on-surface)]">
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
                  w-full text-left px-5 py-4 rounded-xl border-2 transition-colors cursor-pointer
                  ${isSelected
                    ? 'bg-[var(--md-primary-container,#d0e8ff)] border-[var(--md-primary)] text-[var(--md-on-surface)]'
                    : 'bg-transparent border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)]'
                  }
                `}
              >
                <span className="block font-semibold text-sm">{value}</span>
                <span className="block text-xs mt-0.5 opacity-80">{description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full text-sm font-semibold border-2 border-[var(--md-outline-variant)] text-[var(--md-on-surface-variant)] hover:border-[var(--md-primary)] hover:text-[var(--md-primary)] transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors
            ${canSubmit
              ? 'bg-[var(--md-primary)] text-white hover:opacity-90 cursor-pointer'
              : 'bg-[var(--md-outline-variant)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
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
