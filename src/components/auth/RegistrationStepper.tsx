"use client";

interface RegistrationStepperProps {
    readonly currentStep: number;
    readonly totalSteps: number;
    readonly labels?: string[];
}

export default function RegistrationStepper({ currentStep, totalSteps, labels }: RegistrationStepperProps) {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
            <div className="flex items-center justify-between w-full relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2 z-0" />
                <div
                    className="absolute top-1/2 left-0 h-px bg-primary -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {/* Steps */}
                {Array.from({ length: totalSteps }).map((_, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === currentStep;
                    const isCompleted = stepNum < currentStep;

                    return (
                        <div key={stepNum} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-3 h-3 rounded-none border transition-all duration-700 ${isActive
                                        ? "bg-primary border-primary rotate-45 scale-125"
                                        : isCompleted
                                            ? "bg-foreground border-foreground"
                                            : "bg-background border-border/50"
                                    }`}
                            />
                            {labels && labels[i] && (
                                <span className={`absolute top-8 whitespace-nowrap font-mono text-[8px] font-black tracking-[0.4em] uppercase transition-all duration-500 ${isActive ? "text-primary" : "text-muted-foreground/30"
                                    }`}>
                                    {labels[i]}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
