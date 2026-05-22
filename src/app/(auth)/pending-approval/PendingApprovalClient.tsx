"use client";

import { Clock, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

type StatusType = "completed" | "active" | "pending";

const STATUS_ITEMS: Array<{
    title: string;
    status: string;
    type: StatusType;
}> = [
    { title: "Role selection", status: "Complete", type: "completed" },
    { title: "Commitment stage", status: "Complete", type: "completed" },
    { title: "Manual review", status: "Current", type: "active" },
    { title: "Dashboard access", status: "Pending", type: "pending" },
];

export default function PendingApprovalClient({ role }: { role: string }) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Logo size="md" />
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-label text-foreground-muted hover:text-foreground transition-colors"
                        >
                            Product
                        </Link>
                        <Link
                            href="/support"
                            className="text-label text-foreground-muted hover:text-foreground transition-colors"
                        >
                            Support
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 px-6 py-12 lg:py-16 flex flex-col items-center">
                <div className="max-w-xl w-full space-y-10">
                    <div className="space-y-5 text-center">
                        <div
                            className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
                            style={{
                                background: "color-mix(in srgb, var(--warning) 12%, transparent)",
                            }}
                        >
                            <Clock
                                className="h-7 w-7"
                                strokeWidth={2}
                                style={{ color: "var(--warning)" }}
                            />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-display-sm text-foreground">
                                Application under review
                            </h1>
                            <p className="text-body text-foreground-muted max-w-sm mx-auto">
                                Your{" "}
                                <span className="font-medium text-foreground">{role}</span>{" "}
                                application is being reviewed. You&apos;ll be notified via email
                                once a decision has been made.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/settings"
                            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-label text-foreground transition-colors hover:bg-[color:var(--surface-2)]"
                        >
                            View settings
                        </Link>
                    </div>

                    {/* Profile completeness */}
                    <div
                        className="rounded-lg border border-border bg-background p-6 lg:p-8 text-left flex items-center justify-between gap-6"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        <div className="space-y-2 max-w-[60%]">
                            <h3 className="text-title text-foreground">Profile completeness</h3>
                            <p className="text-body-sm text-foreground-muted">
                                Your profile is almost complete. Please make sure all details
                                are accurate.
                            </p>
                            <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
                                <ShieldCheck
                                    className="h-4 w-4"
                                    style={{ color: "var(--brand-green)" }}
                                />
                                <span className="text-eyebrow text-foreground-muted">
                                    NDA status{" "}
                                    <span
                                        className="font-medium"
                                        style={{ color: "var(--brand-green)" }}
                                    >
                                        Signed
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="relative h-20 w-20 shrink-0">
                            <svg
                                className="h-full w-full -rotate-90"
                                viewBox="0 0 36 36"
                                aria-hidden
                            >
                                <path
                                    style={{ color: "var(--surface-2)" }}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    style={{ color: "var(--brand-green)" }}
                                    strokeDasharray="75, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                            </svg>
                            <div
                                className="absolute inset-0 flex items-center justify-center text-label font-medium"
                                style={{ color: "var(--brand-green)" }}
                            >
                                75%
                            </div>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div
                        className="rounded-lg border border-border bg-background p-6 lg:p-8 text-left space-y-5"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                    >
                        {STATUS_ITEMS.map((item) => (
                            <StatusItem
                                key={item.title}
                                title={item.title}
                                status={item.status}
                                type={item.type}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusItem({
    title,
    status,
    type,
}: {
    title: string;
    status: string;
    type: StatusType;
}) {
    const palette =
        type === "completed"
            ? {
                  background: "var(--brand-green-soft)",
                  color: "var(--brand-green)",
              }
            : type === "active"
              ? {
                    background: "color-mix(in srgb, var(--warning) 12%, transparent)",
                    color: "var(--warning)",
                }
              : {
                    background: "var(--surface-2)",
                    color: "var(--foreground-subtle)",
                };

    const labelColor =
        type === "completed"
            ? "var(--brand-green)"
            : type === "active"
              ? "var(--warning)"
              : "var(--foreground-subtle)";

    return (
        <div className="flex items-center gap-3">
            <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={palette}
            >
                {type === "completed" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : type === "active" ? (
                    <Clock className="h-3.5 w-3.5" />
                ) : (
                    <span className="block h-2 w-2 rounded-full bg-current opacity-60" />
                )}
            </span>
            <div className="flex items-center justify-between w-full border-b border-border pb-2">
                <span
                    className={`text-body-sm ${
                        type === "pending"
                            ? "text-foreground-muted"
                            : "text-foreground font-medium"
                    }`}
                >
                    {title}
                </span>
                <span
                    className="text-eyebrow"
                    style={{ color: labelColor }}
                >
                    {status}
                </span>
            </div>
        </div>
    );
}
