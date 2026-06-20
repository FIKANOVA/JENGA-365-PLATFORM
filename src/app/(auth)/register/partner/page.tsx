"use client";

import { Building2, HandHeart } from "lucide-react";
import { RoleCard } from "../_components/RoleCard";
import { RegisterShell } from "../_components/RegisterShell";

export default function PartnerChooserPage() {
    return (
        <RegisterShell
            step="Partnership · Step 1 of 3"
            eyebrow="Choose your partnership"
            heading="Corporate or NGO?"
            subheading="Fund or amplify field programmes with GPS-anchored evidence and quarterly M&E."
        >
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <RoleCard
                    icon={Building2}
                    name="Corporate partner"
                    tagline="Businesses & funders"
                    description="Integrate CSR impact, sponsor talent pipelines, and report on measurable climate action."
                    benefits={[
                        "CSR impact integration",
                        "Talent pipeline visibility",
                        "Quarterly Looker Studio reports",
                        "Aggregated trees-alive metrics",
                    ]}
                    badge={{ label: "Approval required", tone: "warning" }}
                    cta="Partner as corporate"
                    href="/register/corporate"
                    background="black"
                />
                <RoleCard
                    icon={HandHeart}
                    name="NGO partner"
                    tagline="Non-profit & community organisations"
                    description="Collaborate on field programmes, share resources, and amplify community impact alongside the verified network."
                    benefits={[
                        "Joint programme delivery",
                        "Shared field & training resources",
                        "Community amplification",
                        "M&E reporting access",
                    ]}
                    badge={{ label: "Approval required", tone: "warning" }}
                    cta="Partner as NGO"
                    href="/register/ngo"
                    background="green"
                />
            </div>

            <div
                className="mt-12 mx-auto max-w-3xl rounded-md border border-border p-4 lg:p-5 text-body-sm text-foreground-muted"
                style={{ background: "var(--surface-1)" }}
            >
                <span className="font-medium text-foreground">Corporate Unlock Challenge:</span>{" "}
                Disbursements tie to verified ESG milestones. Funds release only when
                trees-alive audits and mentorship-hour targets are met — every metric lives
                in a Looker Studio dashboard.
            </div>
        </RegisterShell>
    );
}
