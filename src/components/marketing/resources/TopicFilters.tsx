"use client";

interface TopicFiltersProps {
    readonly activeTopic: string;
    readonly onTopicChange: (topic: string) => void;
}

const TOPICS = [
    "All Topics",
    "Leadership",
    "Rugby",
    "Career",
    "Finance",
    "Mentorship",
    "Community",
];

export default function TopicFilters({ activeTopic, onTopicChange }: TopicFiltersProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {TOPICS.map((topic) => (
                <button
                    key={topic}
                    onClick={() => onTopicChange(topic)}
                    className={`px-4 py-2 sm:px-5 sm:py-2 text-xs sm:text-label font-semibold transition-all border rounded-full ${activeTopic === topic
                            ? "bg-foreground border-foreground text-background shadow-md"
                            : "bg-background border-border text-foreground hover:border-foreground/60"
                        }`}
                >
                    {topic}
                </button>
            ))}
        </div>
    );
}
