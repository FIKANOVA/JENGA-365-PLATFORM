import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { fetchUserManualBySlug } from "@/lib/sanity/queries";
import { canViewHelpDoc, type HelpAudience, type HelpSessionContext } from "@/lib/auth/helpAccess";
import type { Role } from "@/lib/auth/roles";

type UserManualDetail = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    badge?: { label?: string; tone?: "muted" | "brand" } | null;
    body?: unknown;
    allowedRoles: HelpAudience[];
};

export const dynamic = "force-dynamic";

export default async function HelpDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const manual = (await fetchUserManualBySlug(slug)) as UserManualDetail | null;

    if (!manual) {
        notFound();
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const ctx: HelpSessionContext | null = session?.user
        ? {
              role: ((session.user as { role?: string }).role ?? null) as Role | null,
              moderationScope: (session.user as { moderationScope?: string }).moderationScope ?? null,
          }
        : null;

    if (!canViewHelpDoc(ctx, manual.allowedRoles)) {
        redirect("/403");
    }

    return (
        <main className="bg-background min-h-screen">
            <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 lg:py-20">
                <Link
                    href="/help"
                    className="inline-flex items-center gap-1.5 text-label text-foreground-muted hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Help Center
                </Link>

                <header className="space-y-3 border-b border-border pb-8 mb-8">
                    {manual.badge?.label && (
                        <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                            style={
                                manual.badge.tone === "brand"
                                    ? {
                                          background: "var(--brand-green-soft)",
                                          color: "var(--brand-green)",
                                      }
                                    : {
                                          background: "var(--surface-2)",
                                          color: "var(--foreground-muted)",
                                      }
                            }
                        >
                            {manual.badge.label}
                        </span>
                    )}
                    <h1 className="text-display-md text-foreground">{manual.title}</h1>
                    <p className="text-body-lg text-foreground-muted">{manual.description}</p>
                </header>

                <article className="prose prose-headings:font-medium prose-headings:text-foreground prose-p:text-foreground-muted prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-[color:var(--brand-green)] max-w-none">
                    {manual.body ? (
                        <PortableText value={manual.body as never} />
                    ) : (
                        <p className="text-foreground-muted italic">
                            This manual is being prepared. Check back soon.
                        </p>
                    )}
                </article>
            </div>
        </main>
    );
}
