"use client"

interface Props {
    menteeId: string;
}

export default function FeedbackRatingsSection({ menteeId }: Props) {
    const feedback = {
        latest: {
            quote: "Aisha has shown remarkable growth in her professional confidence and networking ability over the last few sessions.",
            author: "James M, Employee Mentor",
            date: "20 Feb 2026",
            rating: 5
        },
        average: 4.8,
        categories: [
            { label: "Communication", score: 95 },
            { label: "Engagement", score: 88 },
            { label: "Goal adherence", score: 92 },
            { label: "Punctuality", score: 85 },
        ]
    };

    return (
        <section className="space-y-8 animate-fade-up">
            <span className="text-eyebrow text-foreground-muted">Mentor feedback & ratings</span>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Feedback */}
                <div
                    className="rounded-md border border-l-4 border-border bg-background p-8 relative overflow-hidden"
                    style={{ borderLeftColor: "var(--brand-green)", boxShadow: "var(--shadow-sm)" }}
                >
                    <div className="flex mb-6 gap-0.5" style={{ color: "var(--brand-green)" }}>
                        {"★".repeat(feedback.latest.rating)}{"☆".repeat(5 - feedback.latest.rating)}
                    </div>
                    <blockquote className="text-display-sm italic text-foreground leading-relaxed mb-8">
                        “{feedback.latest.quote}”
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <p className="text-body-sm text-foreground-muted">
                            By <span className="font-medium text-foreground">{feedback.latest.author}</span> • {feedback.latest.date}
                        </p>
                        <button
                            className="text-eyebrow hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            View all feedback →
                        </button>
                    </div>
                </div>

                {/* Ratings Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-baseline gap-3 mb-8">
                        <h3 className="text-display-lg text-foreground">{feedback.average}</h3>
                        <div className="space-y-0.5">
                            <div className="text-body-sm" style={{ color: "var(--brand-green)" }}>★★★★★</div>
                            <p className="text-eyebrow text-foreground-muted">Overall rating</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {feedback.categories.map(cat => (
                            <div key={cat.label} className="space-y-2">
                                <div className="flex justify-between text-eyebrow">
                                    <span className="text-foreground-muted">{cat.label}</span>
                                    <span
                                        className="font-medium"
                                        style={{ color: "var(--brand-green)" }}
                                    >
                                        {cat.score}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                    <div
                                        className="h-full animate-progress-fill"
                                        style={{ width: `${cat.score}%`, background: "var(--brand-green)" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
