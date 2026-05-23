import { GraduationCap, Sparkles } from "lucide-react";
import { RoleCard } from "../_components/RoleCard";
import { RegisterShell } from "../_components/RegisterShell";

export default function MentorshipChooserPage() {
    return (
        <RegisterShell
            step="Mentorship · Step 1 of 3"
            eyebrow="Choose your role"
            heading="Mentor or mentee?"
            subheading="AI-matched mentorship built around measurable impact, not vanity metrics."
        >
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <RoleCard
                    icon={GraduationCap}
                    name="Mentee"
                    tagline="Athletes & young professionals"
                    description="AI-matched mentorship, structured community engagement, and resources to compound your growth."
                    benefits={[
                        "Professional mentorship matching",
                        "Resource library & courses",
                        "Community events & clinics",
                        "AI-powered growth profile",
                    ]}
                    badge={{ label: "Instant access", tone: "success" }}
                    cta="Join as mentee"
                    href="/register/mentee"
                    background="green"
                />
                <RoleCard
                    icon={Sparkles}
                    name="Mentor"
                    tagline="Experienced professionals"
                    description="Share expertise in focused, time-boxed sessions. Access founder circles and strategic networks."
                    benefits={[
                        "Guide one focused hour per month",
                        "Strategic network access",
                        "Impact tracking dashboard",
                        "Exclusive founder circles",
                    ]}
                    badge={{ label: "Approval required", tone: "warning" }}
                    cta="Apply as mentor"
                    href="/register/mentor"
                    background="red"
                />
            </div>

            <div
                className="mt-12 mx-auto max-w-3xl rounded-md border border-border p-4 lg:p-5 text-body-sm text-foreground-muted"
                style={{ background: "var(--surface-1)" }}
            >
                <span className="font-medium text-foreground">Sweat equity:</span>{" "}
                Membership is reciprocal. Mentees complete a verified community give-back
                (tree planting, clean-up, book drive) each quarter. Missed contributions
                reset platform access — a three-strikes protocol keeps the ecosystem honest.
            </div>
        </RegisterShell>
    );
}
