import Link from "next/link";

export default function ImpactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 py-24 container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <span className="section-label text-[#006600]">MEASURABLE CHANGE</span>
                    <h1 className="text-6xl font-black mt-2 font-playfair mb-8">Direct Social Impact</h1>
                    <p className="font-lato text-xl text-muted-foreground leading-relaxed">
                        Visualizing the human connection behind the numbers. Our social impact engine tracks every hour of mentorship and every success story.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <ImpactCard
                        title="Mentorship Hubs"
                        value="12"
                        sub="Across 6 Counties"
                    />
                    <ImpactCard
                        title="Active Mentees"
                        value="1,200+"
                        sub="Sustainable Growth"
                    />
                    <ImpactCard
                        title="Success Rate"
                        value="94%"
                        sub="Post- Mentorship Employment"
                    />
                </div>

                <div className="flex justify-center gap-4">
                    <Link href="/impact/map">
                        <button className="px-8 py-4 bg-[#1A1A1A] text-white font-mono text-xs uppercase tracking-[0.2em] font-bold hover:opacity-90 transition-opacity">
                            View Funding Map
                        </button>
                    </Link>
                    <Link href="/register">
                        <button className="px-8 py-4 border border-input font-mono text-xs uppercase tracking-[0.2em] font-bold">
                            Join the Movement
                        </button>
                    </Link>
                </div>
            </main>
        </div>
    );
}

function ImpactCard({ title, value, sub }: any) {
    return (
        <div className="p-10 bg-[#F9F9F8] border border-border text-center">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>
            <div className="text-5xl font-black font-playfair mb-2">{value}</div>
            <p className="font-lato text-sm italic py-2 border-t border-border mt-4">{sub}</p>
        </div>
    )
}
