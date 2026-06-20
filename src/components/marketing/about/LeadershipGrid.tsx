import Link from "next/link";
import { urlFor } from "@/lib/sanity/client";

interface SanityTeamOfficial {
    _id: string;
    name: string;
    role: string;
    bio?: string;
    linkedinUrl?: string;
    headshot?: {
        asset?: { _id?: string; url?: string };
        alt?: string;
    };
}

interface LeadershipGridProps {
    readonly team?: SanityTeamOfficial[];
}

export default function LeadershipGrid({ team = [] }: LeadershipGridProps) {
    if (!team || team.length === 0) {
        return (
            <section className="py-16 md:py-32 bg-[var(--surface-1)]">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="mb-12 space-y-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-[var(--brand-green)] block font-bold">
                            The People
                        </span>
                        <h2 className="font-serif font-bold text-5xl md:text-6xl text-black uppercase tracking-tighter">
                            Architects of Change
                        </h2>
                    </div>
                    <p className="text-body-lg text-foreground-muted">
                        Team roster coming soon.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-32 bg-[var(--surface-1)]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-24 space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-[var(--brand-green)] block font-bold">
                        The People
                    </span>
                    <h2 className="font-serif font-bold text-5xl md:text-6xl text-black uppercase tracking-tighter">
                        Architects of Change
                    </h2>
                    <p className="font-light text-lg text-[var(--foreground-muted)] leading-relaxed max-w-2xl">
                        Built with editorial heritage & technical precision by Kenya&apos;s finest sporting minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {team.map((member) => {
                        const imgUrl = member.headshot?.asset?.url
                            ? urlFor(member.headshot).width(800).height(1067).fit("crop").auto("format").url()
                            : null;
                        const alt = member.headshot?.alt || member.name;
                        const card = (
                            <div className="group flex flex-col space-y-8">
                                <div className="aspect-[3/4] overflow-hidden bg-black relative border border-black/5">
                                    {imgUrl ? (
                                        <img
                                            src={imgUrl}
                                            alt={alt}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--surface-2)]" aria-hidden />
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-serif font-bold text-3xl text-black uppercase tracking-tight group-hover:text-[var(--brand-green)] transition-colors duration-500">
                                        {member.name}
                                    </h3>
                                    <div className="h-px w-12 bg-[var(--brand-green)] group-hover:bg-[var(--brand-red)] transition-colors duration-500 mb-4" />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--brand-green)] font-bold block">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        );

                        return member.linkedinUrl ? (
                            <Link
                                key={member._id}
                                href={member.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                            >
                                {card}
                            </Link>
                        ) : (
                            <div key={member._id}>{card}</div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
