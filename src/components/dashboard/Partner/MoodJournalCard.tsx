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
        <section className="jenga-card p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <span className="section-label mb-2">Mood Journal</span>
            <p className="font-lato text-[13px] text-muted-foreground mb-6">
                Mentee self-reported wellbeing during sessions
            </p>

            <div className="grid grid-cols-7 gap-2 mb-8">
                {journal.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 p-2 bg-muted/5 rounded border border-transparent hover:border-border transition-all">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase">{day.date}</span>
                        <span className="text-xl" title="Feeling Good">{day.emoji}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="bg-[#F0FFF0] text-[#006600] px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-tight font-medium">
                    Generally Positive
                </div>
            </div>

            <button className="w-full font-mono text-[10px] text-[#BB0000] uppercase tracking-widest hover:underline text-left">
                View full journal →
            </button>
        </section>
    );
}
