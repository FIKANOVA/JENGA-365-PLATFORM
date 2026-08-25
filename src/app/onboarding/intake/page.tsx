"use client"

import { useState } from "react"
import IntakeProgress from "@/components/intake/IntakeProgress"
import SubmittingScreen from "@/components/intake/SubmittingScreen"
import StepOne from "@/components/intake/StepOne"
import StepTwo from "@/components/intake/StepTwo"
import StepThree from "@/components/intake/StepThree"
import { submitDiagnosticIntake } from "@/lib/actions/intake"
import type {
  Q1Response,
  Q2Response,
  AcademicStanding,
  CareerTag,
  SupportType,
  MentorshipStyle,
  IntakeFormData,
} from "@/lib/intake/types"

type FormState = {
  q1: Q1Response | null
  q2: Q2Response | null
  academicStanding: AcademicStanding | null
  careerTags: CareerTag[]
  careerFreeText: string
  supportTypes: SupportType[]
  preferredMentorshipStyle: MentorshipStyle | null
}

const INITIAL_STATE: FormState = {
  q1: null,
  q2: null,
  academicStanding: null,
  careerTags: [],
  careerFreeText: "",
  supportTypes: [],
  preferredMentorshipStyle: null,
}

const STEP_LABELS: [string, string, string] = [
  "How are you doing?",
  "Where are you headed?",
  "How do you want to be mentored?",
]

export default function IntakePage() {
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onChange(field: keyof FormState, value: unknown) {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitDiagnosticIntake(formState as IntakeFormData)
      // redirect happens inside the action — this line may never run
    } catch (err: unknown) {
      // Next.js redirect throws a special error — don't treat it as a failure
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
      ) {
        return // successful redirect — do nothing
      }
      setIsSubmitting(false)
      setError("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl bg-background border border-border rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="text-center space-y-1.5 mb-8">
          <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
            Phase 2 · Diagnostic Intake
          </p>
          <h1 className="text-display-sm text-foreground">
            Set up your mentorship profile
          </h1>
          <p className="text-body-sm text-foreground-muted max-w-md mx-auto">
            Answer a few quick questions to help us match you with the ideal mentors and pathways.
          </p>
        </div>

        <IntakeProgress currentStep={currentStep} stepLabels={STEP_LABELS} />

        <div className="mt-8">
          {currentStep === 1 && (
            <StepOne
              q1={formState.q1}
              q2={formState.q2}
              onChange={(field, value) => onChange(field, value)}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <StepTwo
              academicStanding={formState.academicStanding}
              careerTags={formState.careerTags}
              careerFreeText={formState.careerFreeText}
              onChange={(field, value) => onChange(field, value)}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <StepThree
              supportTypes={formState.supportTypes}
              preferredMentorshipStyle={formState.preferredMentorshipStyle}
              onChange={(field, value) => onChange(field, value)}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}

          {error && (
            <p className="mt-4 text-sm text-[var(--brand-red)] text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <SubmittingScreen visible={isSubmitting} />
    </div>
  )
}
