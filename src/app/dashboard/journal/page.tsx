import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMenteeMoodJournal } from "@/lib/db/queries/dashboard";
import { Smile, Meh, Frown } from "lucide-react";

export default async function JournalPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    const userId = session.user.id;

    const entries = await getMenteeMoodJournal(userId).catch(() => []);

    const moodIcon = (score: number) => {
        if (score >= 4) return <Smile className="w-5 h-5" style={{ color: "var(--brand-green)" }} />;
        if (score <= 2) return <Frown className="w-5 h-5" style={{ color: "var(--brand-red)" }} />;
        return <Meh className="w-5 h-5 text-yellow-500" />;
    };

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">My journal</h1>
                    <p className="text-body-sm text-foreground-muted">Mood tracking and reflection log</p>
                </div>

                {entries.length === 0 ? (
                    <div
                        className="py-16 text-center border border-dashed border-border rounded-md"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <Smile className="w-12 h-12 mx-auto text-foreground-subtle mb-4" />
                        <p className="text-body-sm text-foreground-muted">No journal entries yet.</p>
                        <p className="text-eyebrow text-foreground-muted mt-1">
                            Entries are created after mentorship sessions.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry: any) => (
                            <div
                                key={entry.id}
                                className="rounded-md border border-border bg-background p-6 space-y-3 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {moodIcon(entry.moodScore)}
                                        <span className="text-eyebrow text-foreground-muted">
                                            Mood: {entry.moodScore}/5
                                        </span>
                                    </div>
                                    <span className="text-eyebrow text-foreground-muted">
                                        {new Date(entry.recordedAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                                    </span>
                                </div>
                                {entry.notes && (
                                    <p className="text-body-sm text-foreground leading-relaxed">{entry.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
