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
        if (score >= 4) return <Smile className="w-5 h-5 text-green-500" />;
        if (score <= 2) return <Frown className="w-5 h-5 text-red-400" />;
        return <Meh className="w-5 h-5 text-yellow-500" />;
    };

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="font-playfair text-4xl font-black text-foreground mb-2">My Journal</h1>
                    <p className="text-muted-foreground font-mono text-sm">Mood tracking and reflection log</p>
                </div>

                {entries.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-border rounded-lg">
                        <Smile className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="font-mono text-sm text-muted-foreground">No journal entries yet.</p>
                        <p className="font-mono text-xs text-muted-foreground/60 mt-1">Entries are created after mentorship sessions.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry: any) => (
                            <div key={entry.id} className="bg-card border border-border/50 rounded-lg p-6 space-y-3 hover:border-border transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {moodIcon(entry.moodScore)}
                                        <span className="font-mono text-xs text-muted-foreground">
                                            Mood: {entry.moodScore}/5
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {new Date(entry.recordedAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                                    </span>
                                </div>
                                {entry.notes && (
                                    <p className="font-lato text-sm text-foreground/80 leading-relaxed">{entry.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
