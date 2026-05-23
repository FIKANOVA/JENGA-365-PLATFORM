import Link from "next/link";
import Logo from "@/components/shared/Logo";

export function RegisterShell({
    step,
    eyebrow,
    heading,
    subheading,
    children,
}: {
    step: string;
    eyebrow: string;
    heading: string;
    subheading: string;
    children: React.ReactNode;
}) {
    return (
        <>
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo size="md" />
                    <div className="flex items-center gap-3">
                        <span className="text-eyebrow text-foreground-muted">{step}</span>
                        <span className="hidden sm:inline-block h-px w-8 bg-border" />
                        <Link
                            href="/login"
                            className="text-label text-foreground-muted hover:text-foreground transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 mx-auto w-full max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
                <div className="max-w-2xl mx-auto text-center space-y-4">
                    <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        {eyebrow}
                    </p>
                    <h1 className="text-display-md text-foreground">{heading}</h1>
                    <p className="text-body-lg text-foreground-muted">{subheading}</p>
                </div>

                {children}

                <div className="mt-10 text-center">
                    <p className="text-body-sm text-foreground-muted">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
}
