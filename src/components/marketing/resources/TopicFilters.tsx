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
                    className={`px-5 py-2.5 text-[9px] font-bold tracking-[0.2em] transition-all border rounded-sm ${activeTopic === topic
                            ? "bg-black border-black text-white shadow-xl"
                            : "bg-white border-[var(--border)] text-black hover:border-black"
                        }`}
                    style={{ fontFamily: "var(--font-dm-mono)" }}
                >
                    {topic.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
