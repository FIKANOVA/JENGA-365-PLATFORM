import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

const RESOURCE_LINKS = [
    { label: "Articles & Insights", href: "/articles", description: "Expert articles from mentors and thought leaders" },
    { label: "Mentorship Resources", href: "/resources", description: "Guides, toolkits, and learning materials" },
    { label: "Help Centre", href: "/help", description: "Platform manuals and how-to guides" },
    { label: "Jenga365 Blog", href: "/articles", description: "Latest news and platform updates" },
];

export default function ContentPage() {
    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="font-playfair text-4xl font-black text-foreground mb-2">Resources</h1>
                    <p className="text-muted-foreground font-mono text-sm">Curated learning materials and platform guides</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {RESOURCE_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group bg-card border border-border/50 rounded-lg p-6 hover:border-[var(--primary-green)] transition-all hover:shadow-md space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
                                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[var(--primary-green)] transition-colors" />
                            </div>
                            <div>
                                <h3 className="font-playfair font-bold text-lg text-foreground group-hover:text-[var(--primary-green)] transition-colors">
                                    {item.label}
                                </h3>
                                <p className="font-lato text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
