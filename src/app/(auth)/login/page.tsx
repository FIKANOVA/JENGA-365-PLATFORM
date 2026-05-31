import { Suspense } from "react";
import Logo from "@/components/shared/Logo";
import { fetchSiteSettings } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
    const settings = await fetchSiteSettings().catch(() => null);
    const authImage = settings?.authImage ?? null;
    const imageUrl = authImage?.asset?.url
        ? urlFor(authImage).width(1400).height(1800).fit("crop").auto("format").url()
        : null;
    const hasImage = !!imageUrl;

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left panel — form */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
                <div className="lg:hidden mb-12">
                    <Logo size="md" />
                </div>
                <Suspense
                    fallback={
                        <div className="text-body-sm text-foreground-muted animate-pulse">Loading…</div>
                    }
                >
                    <LoginForm />
                </Suspense>
            </main>

            {/* Right panel — CMS-editable brand image (falls back to brand surface) */}
            <aside
                className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 xl:p-16 border-l border-border bg-hero-radial bg-topo overflow-hidden"
                style={{ backgroundColor: "var(--surface-1)" }}
            >
                {hasImage && (
                    <>
                        <img
                            src={imageUrl!}
                            alt={authImage?.alt ?? ""}
                            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                        />
                        <div
                            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/45 to-black/30"
                            aria-hidden
                        />
                        <div className="absolute inset-0 bg-topo opacity-[0.10] pointer-events-none" aria-hidden />
                    </>
                )}

                <div className="relative z-10">
                    <Logo size="lg" tone={hasImage ? "light" : "default"} />
                </div>

                <div className="relative z-10 max-w-md space-y-6">
                    <p className="text-eyebrow" style={{ color: hasImage ? "#7CE2A8" : "var(--brand-green)" }}>
                        Mentorship · Sport · Climate
                    </p>
                    <h2 className="text-display-sm" style={{ color: hasImage ? "#FFFFFF" : "var(--foreground)" }}>
                        Building the Total Athlete, 365 days a year.
                    </h2>
                    <p
                        className="text-body"
                        style={{ color: hasImage ? "rgba(255,255,255,0.82)" : "var(--foreground-muted)" }}
                    >
                        AI-matched mentorship plus measurable climate action — verified on the ground, surfaced in your dashboard.
                    </p>
                </div>

                <div
                    className="relative z-10 text-body-sm"
                    style={{ color: hasImage ? "rgba(255,255,255,0.6)" : "var(--foreground-subtle)" }}
                >
                    © {new Date().getFullYear()} Jenga365 · Nairobi
                </div>
            </aside>
        </div>
    );
}
