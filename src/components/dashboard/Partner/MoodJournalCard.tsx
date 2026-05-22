"use client"

interface Props {
    menteeId: string;
}

export default function MoodJournalCard({ menteeId }: Props) {
    const journal = [
        { date: "1 Mar", emoji: "😊" },
        { date: "26 Feb", emoji: "🙂" },
        { date: "22 Feb", emoji: "😊" },
        { date: "18 Feb", emoji: "😐" },
        { date: "14 Feb", emoji: "🙂" },
        { date: "10 Feb", emoji: "😊" },
        { date: "3 Feb", emoji: "😊" },
    ];

    return (
        <section
            className="rounded-lg border border-border bg-background p-6 animate-fade-up"
            style={{ animationDelay: "100ms", boxShadow: "var(--shadow-sm)" }}
        >
            <span className="text-eyebrow text-foreground-muted mb-2 block">Mood journal</span>
            <p className="text-body-sm text-foreground-muted mb-6">
                Mentee self-reported wellbeing during sessions
            </p>

            <div className="grid grid-cols-7 gap-2 mb-8">
                {journal.map((day, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-1.5 p-2 rounded border border-transparent hover:border-border transition-all"
                        style={{ background: "var(--surface-1)" }}
                    >
                        <span className="text-eyebrow text-foreground-muted">{day.date}</span>
                        <span className="text-xl" title="Mood">{day.emoji}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div
                    className="px-4 py-2 rounded-full text-label"
                    style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                >
                    Generally positive
                </div>
            </div>

            <button
                className="w-full text-eyebrow hover:underline text-left"
                style={{ color: "var(--brand-red)" }}
            >
                View full journal →
            </button>
        </section>
    );
}
