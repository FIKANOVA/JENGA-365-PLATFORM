import Link from "next/link";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";

export const metadata = {
    title: "Voices | Jenga365",
    description: "Real stories from mentors, mentees, and community members in the Jenga365 network.",
};

export default function VoicesPage() {
    return (
        <div className="flex flex-col bg-[var(--off-white)]">
            <section className="bg-[var(--off-white)] border-b border-[var(--border)] pt-40 pb-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="max-w-3xl space-y-8">
                        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)] block">
                            Stories
                        </span>
                        <h1 className="font-serif font-black text-6xl md:text-8xl text-black uppercase leading-[0.9] tracking-tighter">
                            Community<br />
                            <span className="italic text-[var(--primary-green)]">Voices.</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] font-light leading-relaxed max-w-2xl">
                            Hear from the mentors, mentees, and partners who are shaping the Jenga365 story — one conversation at a time.
                        </p>
                        <Link
                            href="/articles"
                            className="btn-primary inline-flex items-center gap-3 shadow-xl font-mono text-[11px] uppercase tracking-widest"
                        >
                            Read Articles
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-28">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <span className="material-symbols-outlined text-8xl text-[var(--border)] block mb-8">record_voice_over</span>
                    <h2 className="font-serif font-black text-4xl uppercase tracking-tighter text-black mb-4">Stories Coming Soon</h2>
                    <p className="text-[var(--text-muted)] font-light max-w-md mx-auto">
                        We&apos;re gathering stories from our community. Check back soon or explore our articles in the meantime.
                    </p>
                </div>
            </section>

            <AboutCTAStrip />
        </div>
    );
}
