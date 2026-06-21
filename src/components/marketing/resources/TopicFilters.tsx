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
                    className={`px-5 py-2.5 text-label font-bold transition-all border rounded-md ${activeTopic === topic
                            ? "bg-black border-black text-white shadow-xl"
                            : "bg-white border-border text-black hover:border-foreground"
                        }`}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                    {topic.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
