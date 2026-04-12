interface IntakeProgressProps {
  currentStep: 1 | 2 | 3
  stepLabels: [string, string, string]
}

export default function IntakeProgress({ currentStep, stepLabels }: IntakeProgressProps) {
  return (
    <nav aria-label="Intake progress" className="flex items-center justify-center gap-0 font-mono">
      {stepLabels.map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                aria-current={isActive ? "step" : undefined}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${isCompleted
                    ? "bg-[var(--md-primary-container)] border-[var(--md-primary-container)] text-white"
                    : isActive
                    ? "bg-[var(--md-primary)] border-[var(--md-primary)] text-white"
                    : "bg-transparent border-[var(--md-outline-variant)] text-[var(--text-muted)]"
                  }
                `}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {/* Label */}
              <span
                className={`text-xs tracking-wide uppercase leading-tight text-center max-w-[72px] ${
                  isActive
                    ? "font-bold text-[var(--md-on-surface)]"
                    : isCompleted
                    ? "font-semibold text-[var(--md-on-surface-variant)]"
                    : "font-normal text-[var(--text-muted)]"
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
                    ? "bg-[var(--md-primary-container)]"
                    : "bg-[var(--md-outline-variant)]"
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
