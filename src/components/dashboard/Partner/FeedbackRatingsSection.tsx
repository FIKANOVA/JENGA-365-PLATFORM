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
            { label: "Goal Adherence", score: 92 },
            { label: "Punctuality", score: 85 },
        ]
    };

    return (
        <section className="space-y-8 animate-fade-up">
            <span className="section-label">Mentor Feedback & Ratings</span>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Latest Feedback */}
                <div className="jenga-card p-8 border-l-4 border-l-primary relative overflow-hidden">
                    <div className="flex text-primary mb-6 gap-0.5">
                        {"★".repeat(feedback.latest.rating)}{"☆".repeat(5 - feedback.latest.rating)}
                    </div>
                    <blockquote className="font-playfair italic text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                        "{feedback.latest.quote}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <p className="font-lato text-sm text-[#4A4A4A]">
                            By <span className="font-bold">{feedback.latest.author}</span> • {feedback.latest.date}
                        </p>
                        <button className="font-mono text-[10px] text-primary uppercase tracking-widest hover:underline">
                            View all feedback →
                        </button>
                    </div>
                </div>

                {/* Ratings Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-baseline gap-3 mb-8">
                        <h3 className="font-playfair font-black text-5xl text-foreground">
                            {feedback.average}
                        </h3>
                        <div className="space-y-0.5">
                            <div className="text-primary text-xs">★★★★★</div>
                            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                                Overall Rating
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {feedback.categories.map(cat => (
                            <div key={cat.label} className="space-y-2">
                                <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest">
                                    <span>{cat.label}</span>
                                    <span className="text-primary font-bold">{cat.score}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#E8E4DC] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-[#006600] animate-progress-fill"
                                        style={{ width: `${cat.score}%` }}
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
