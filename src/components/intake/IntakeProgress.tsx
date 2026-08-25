interface IntakeProgressProps {
  currentStep: 1 | 2 | 3
  stepLabels: [string, string, string]
}

export default function IntakeProgress({ currentStep, stepLabels }: IntakeProgressProps) {
  return (
    <nav aria-label="Intake progress" className="flex items-center justify-center gap-0">
      {stepLabels.map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                aria-current={isActive ? "step" : undefined}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${isCompleted
                    ? "bg-[var(--brand-green)] border-2 border-[var(--brand-green)] text-white shadow-sm"
                    : isActive
                    ? "bg-[var(--brand-green)] border-2 border-[var(--brand-green)] text-white shadow-sm"
                    : "bg-background border-2 border-border text-[var(--foreground-subtle)]"
                  }
                `}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {/* Label */}
              <span
                className={`text-xs tracking-wide leading-tight text-center max-w-[80px] ${
                  isActive
                    ? "font-semibold text-foreground"
                    : isCompleted
                    ? "font-medium text-foreground-muted"
                    : "font-normal text-[var(--foreground-subtle)]"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {stepNumber < 3 && (
              <div
                className={`w-16 h-0.5 mb-5 mx-1 transition-colors ${
                  stepNumber < currentStep
                    ? "bg-[var(--brand-green)]"
                    : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
