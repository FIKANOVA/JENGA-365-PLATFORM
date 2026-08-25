"use client"

import type { AcademicStanding, CareerTag } from '@/lib/intake/types'
import { CAREER_TAGS } from '@/lib/intake/types'
import AvatarUpload from '@/components/shared/AvatarUpload'

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
      {/* Optional Avatar Upload */}
      <div className="flex flex-col gap-2 p-4 rounded-lg border border-border/60 bg-[var(--surface-1)]">
        <p className="font-semibold text-foreground text-sm">
          Profile Photo <span className="font-normal text-xs text-foreground-muted">(optional)</span>
        </p>
        <AvatarUpload userName="Mentee" size="sm" />
      </div>
      {/* Academic Standing */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
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
                  flex-1 min-w-[100px] px-4 py-3.5 rounded-md text-sm font-medium transition-all cursor-pointer text-center
                  ${isSelected
                    ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green-soft)] text-foreground font-semibold shadow-sm'
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

      {/* Career Direction */}
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-foreground text-body">
          What are you working toward?{' '}
          <span className="font-normal text-foreground-muted text-xs">(pick up to 3)</span>
        </p>
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="What are you working toward?">
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
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isDisabled
                    ? 'opacity-40 cursor-not-allowed border border-border bg-[var(--surface-2)] text-foreground-muted'
                    : isSelected
                      ? 'border-2 border-[var(--brand-green)] bg-[var(--brand-green)] text-white shadow-sm font-semibold cursor-pointer'
                      : 'border border-border bg-background text-foreground hover:border-[var(--brand-green)] hover:bg-[var(--surface-1)] cursor-pointer'
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
          className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-[var(--foreground-subtle)] focus:border-[var(--brand-green)] focus:outline-none resize-none transition-colors"
        />
        <p className="text-right text-xs text-foreground-muted">
          {careerFreeText.length} / {MAX_FREE_TEXT}
        </p>
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
