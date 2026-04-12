"use client";

import Link from "next/link";
import RegistrationStepper from "@/components/auth/RegistrationStepper";
import Logo from "@/components/shared/Logo";

interface MinimalHeaderProps {
    readonly currentStep?: number;
    readonly totalSteps?: number;
}

export default function MinimalHeader({ currentStep = 1, totalSteps = 3 }: MinimalHeaderProps) {
    return (
        <header className="w-full bg-background/95 backdrop-blur-md border-b border-border py-8 sticky top-0 z-[100]">
            <div className="container mx-auto px-6 flex flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-4">
                    <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
                        <Logo variant="premium" height={44} priority />
                    </Link>
                    <span className="font-mono text-[8px] uppercase tracking-[0.5em] text-muted-foreground/40 font-black">Jenga365 Platform</span>
                </div>

                {currentStep > 0 && (
                    <div className="w-full max-w-xs">
                        <RegistrationStepper
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            labels={["Protocol", "Credentials", "Consent"]}
                        />
                    </div>
                )}
            </div>
        </header>
    );
}
