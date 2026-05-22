import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

const RESOURCE_LINKS = [
    { label: "Articles & insights", href: "/articles", description: "Expert articles from mentors and thought leaders" },
    { label: "Mentorship resources", href: "/resources", description: "Guides, toolkits, and learning materials" },
    { label: "Help centre", href: "/help", description: "Platform manuals and how-to guides" },
    { label: "Jenga365 blog", href: "/articles", description: "Latest news and platform updates" },
];

export default function ContentPage() {
    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">Resources</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Curated learning materials and platform guides
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RESOURCE_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-[color:var(--border-strong,#D4D4D8)] space-y-3"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-center justify-between">
                                <BookOpen className="w-5 h-5" style={{ color: "var(--brand-green)" }} />
                                <ExternalLink className="w-4 h-4 text-foreground-subtle group-hover:text-foreground transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-headline text-foreground">{item.label}</h3>
                                <p className="text-body-sm text-foreground-muted mt-1">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
