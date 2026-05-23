import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center">
                    <Logo size="md" />
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            404
                        </p>
                        <h1 className="text-display-md text-foreground">Page not found</h1>
                        <p className="text-body text-foreground-muted">
                            The page you&apos;re looking for doesn&apos;t exist or has been moved.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex h-11 items-center justify-center rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)" }}
                        >
                            Return home
                        </Link>
                        <Link
                            href="/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            Go to dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
