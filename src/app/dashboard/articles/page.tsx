import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, isNull, desc } from "drizzle-orm";
import { Plus, PenSquare } from "lucide-react";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import AuthorArticleRow, { type ArticleStatus } from "@/components/dashboard/articles/AuthorArticleRow";

export const dynamic = "force-dynamic";

const NEON_TO_ROW_STATUS: Record<string, ArticleStatus> = {
    draft: "DRAFT",
    in_review: "IN_REVIEW",
    published: "PUBLISHED",
    rejected: "REJECTED",
    unpublished: "REJECTED",
};

export default async function MyArticlesPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login?next=/dashboard/articles");

    const rows = await db.query.articles.findMany({
        where: and(eq(articles.authorId, session.user.id), isNull(articles.deletedAt)),
        orderBy: [desc(articles.lastEditedAt)],
    });

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-6">
                    <div className="space-y-1">
                        <h1 className="text-display-md text-foreground">My articles</h1>
                        <p className="text-body-sm text-foreground-muted">
                            Draft, edit, and submit articles. Submitted pieces enter the moderator queue.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/articles/new"
                        className="inline-flex items-center gap-2 h-10 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90 self-start sm:self-auto"
                        style={{ background: "var(--brand-red)", color: "#ffffff" }}
                    >
                        <Plus className="w-4 h-4" />
                        New article
                    </Link>
                </header>

                {rows.length === 0 ? (
                    <div
                        className="rounded-lg border border-dashed border-border p-12 text-center space-y-3"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <PenSquare className="w-10 h-10 mx-auto text-foreground-subtle" />
                        <p className="text-body-sm text-foreground-muted">
                            You haven't drafted any articles yet.
                        </p>
                        <Link
                            href="/dashboard/articles/new"
                            className="inline-flex items-center gap-2 h-9 rounded-md px-3 text-label transition-colors hover:bg-[color:var(--surface-2)] border border-border bg-background text-foreground"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Start your first draft
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {rows.map((article) => (
                            <AuthorArticleRow
                                key={article.id}
                                id={article.id}
                                title={article.title}
                                category={article.category ?? "General"}
                                date={new Date(article.lastEditedAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                                status={NEON_TO_ROW_STATUS[article.status] ?? "DRAFT"}
                                feedback={article.rejectionFeedback ?? undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
