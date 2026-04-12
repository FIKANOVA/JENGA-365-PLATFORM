"use client"

import type { AcademicStanding, CareerTag } from '@/lib/intake/types'
import { CAREER_TAGS } from '@/lib/intake/types'

const MAX_CAREER_TAGS = 3
const MAX_FREE_TEXT = 280

const ACADEMIC_OPTIONS: AcademicStanding[] = ['Good', 'Probation', 'Honors']

interface StepTwoProps {
  academicStanding: AcademicStanding | null
  careerTags: CareerTag[]
  careerFreeText: string
  onChange: (field: 'academicStanding' | 'careerTags' | 'careerFreeText', value: AcademicStanding | CareerTag[] | string) => void
  onNext: () => void
  onBack: () => void
}

export default function StepTwo({
  academicStanding,
  careerTags,
  careerFreeText,
  onChange,
  onNext,
  onBack,
}: StepTwoProps) {
  const canProceed = academicStanding !== null && careerTags.length > 0
  const maxTagsReached = careerTags.length >= MAX_CAREER_TAGS

  function handleCareerTagToggle(tag: CareerTag) {
    const isSelected = careerTags.includes(tag)
    if (isSelected) {
      onChange('careerTags', careerTags.filter((t) => t !== tag))
    } else {
      if (maxTagsReached) return
      onChange('careerTags', [...careerTags, tag])
    }
  }

  return (
    <section className="flex flex-col gap-8">
      {/* Academic Standing */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-[var(--md-on-surface)]">
          How&apos;s your academic standing?
        </p>
        <div className="flex flex-wrap gap-3" role="group" aria-label="How's your academic standing?">
          {ACADEMIC_OPTIONS.map((option) => {
            const isSelected = academicStanding === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange('academicStanding', option)}
                aria-pressed={isSelected}
                className={`
                  flex-1 min-w-[100px] px-4 py-4 rounded-xl text-sm font-medium border-2 transition-colors cursor-pointer text-center
                  ${isSelected
                    ? 'bg-[var(--md-primary-container,#d0e8ff)] border-[var(--md-primary)] text-[var(--md-on-surface)]'
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

      {/* Career Direction */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-[var(--md-on-surface)]">
          What are you working toward?{' '}
          <span className="font-normal text-[var(--md-on-surface-variant)] text-xs">(pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="What are you working toward?">
          {CAREER_TAGS.map((tag) => {
            const isSelected = careerTags.includes(tag)
            const isDisabled = !isSelected && maxTagsReached
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleCareerTagToggle(tag)}
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
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Free Text */}
      <div className="flex flex-col gap-2">
        <textarea
          value={careerFreeText}
          onChange={(e) => {
            if (e.target.value.length <= MAX_FREE_TEXT) {
              onChange('careerFreeText', e.target.value)
            }
          }}
          placeholder="Tell us more about your career aspirations…"
          rows={4}
          maxLength={MAX_FREE_TEXT}
          className="w-full rounded-xl border-2 border-[var(--md-outline-variant)] bg-transparent px-4 py-3 text-sm text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] focus:border-[var(--md-primary)] focus:outline-none resize-none transition-colors"
        />
        <p className="text-right text-xs text-[var(--md-on-surface-variant)]">
          {careerFreeText.length} / {MAX_FREE_TEXT}
        </p>
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
