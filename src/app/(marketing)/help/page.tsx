import Link from 'next/link';
import { Search, BookOpen, Users, ShieldCheck, MessageCircle, Mail } from 'lucide-react';
import FAQSection from "@/components/marketing/FAQSection";

export const metadata = {
    title: "Help Center | Jenga365",
    description: "Get support and find answers to common questions about Jenga365.",
};

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-[#F5F5F5]">
            {/* Hero Section */}
            <section className="bg-[#F5F5F5] py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-5xl mb-8 leading-tight font-bold text-[#000000] uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                        How can we help you today?
                    </h1>

                    {/* Search Bar Container */}
                    <div className="max-w-3xl mx-auto relative cursor-text">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-[#000000]/40" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-14 pr-6 py-5 rounded-sm border border-[#000000]/10 shadow-sm focus:ring-[var(--primary-green)] focus:border-[var(--primary-green)] text-lg text-[#000000] placeholder:text-[#000000]/40 font-lato transition-all"
                            placeholder="Search documentation, tutorials, or FAQs..."
                        />
                    </div>
                    <p className="mt-6 text-[#000000]/60 text-sm italic font-lato">
                        Popular searches: Mentor onboarding, article approval, profile verification
                    </p>
                </div>
            </section>

            {/* Manual Access Cards */}
            <section className="py-12 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: General */}
                    <div className="border border-[#000000]/10 p-10 flex flex-col hover:shadow-lg transition-all duration-300 bg-white rounded-sm group cursor-pointer hover:border-[var(--primary-green)]/50">
                        <div className="mb-6">
                            <BookOpen className="w-12 h-12 text-[var(--mentorship-green)]" />
                        </div>
                        <h3 className="text-2xl mb-3 font-bold text-[#000000] uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>General User Manual</h3>
                        <p className="text-[#000000]/80 mb-8 flex-grow leading-relaxed font-lato">
                            Everything you need to know as a mentee or mentor on the Jenga365 platform. Profile setup, messaging, and course access.
                        </p>
                        <button className="text-[var(--primary-green)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all underline-offset-4 font-mono text-xs uppercase tracking-widest mt-auto">
                            Read Manual <span>→</span>
                        </button>
                    </div>

                    {/* Card 2: Collaborator */}
                    <div className="border border-[#000000]/10 p-10 flex flex-col hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden rounded-sm group cursor-pointer hover:border-[#000000]/30">
                        {/* Restricted Badge */}
                        <div className="absolute top-0 right-0 bg-[#000000] text-white px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest font-mono">
                            Restricted
                        </div>
                        <div className="mb-6">
                            <Users className="w-12 h-12 text-[var(--primary-green)]" />
                        </div>
                        <h3 className="text-2xl mb-3 font-bold text-[#000000] uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Collaborator Manual</h3>
                        <p className="text-[#000000]/80 mb-8 flex-grow leading-relaxed font-lato">
                            Guides for corporate partners and moderators. Manage group mentorship programs and content compliance.
                        </p>
                        <button className="text-[var(--primary-green)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all underline-offset-4 font-mono text-xs uppercase tracking-widest mt-auto">
                            Read Manual <span>→</span>
                        </button>
                    </div>

                    {/* Card 3: SuperAdmin */}
                    <div className="border border-[var(--primary-green)]/30 p-10 flex flex-col hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden rounded-sm group cursor-pointer hover:border-[var(--primary-green)]">
                        {/* Confidential Badge */}
                        <div className="absolute top-0 right-0 bg-[var(--primary-green)] text-white px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest font-mono">
                            Confidential
                        </div>
                        <div className="mb-6">
                            <ShieldCheck className="w-12 h-12 text-[#000000]" />
                        </div>
                        <h3 className="text-2xl mb-3 font-bold text-[#000000] uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>SuperAdmin Manual</h3>
                        <p className="text-[#000000]/80 mb-8 flex-grow leading-relaxed font-lato">
                            Internal system operations, database management, and platform-wide configuration settings for IT staff.
                        </p>
                        <button className="text-[var(--primary-green)] font-bold flex items-center gap-2 group-hover:gap-3 transition-all underline-offset-4 font-mono text-xs uppercase tracking-widest mt-auto">
                            Read Manual <span>→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Popular Topics */}
            <section className="py-20 bg-[#F5F5F5] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-[#000000]/10 pb-6 gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#000000] uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Popular Topics</h2>
                        <Link href="/" className="text-[var(--primary-green)] font-bold hover:underline mb-2 font-mono text-xs uppercase tracking-widest">
                            View all topics →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "How to find a mentor", desc: "A step-by-step guide to finding the right match for your career." },
                            { title: "Approving articles", desc: "For moderators: The standard checklist for content quality." },
                            { title: "KYC Verification", desc: "Understanding the identification process for mentors." },
                            { title: "Setting up Payments", desc: "Connect your local bank account or mobile wallet." },
                            { title: "Live Sessions Guide", desc: "How to use the built-in video conferencing tool." },
                            { title: "Reporting Harassment", desc: "Safety first: How to report inappropriate behavior." },
                            { title: "Certificates & Badges", desc: "Earning and sharing your accomplishments on social media." },
                            { title: "Account Deletion", desc: "Data privacy and permanent account removal process." }
                        ].map((topic, i) => (
                            <Link key={i} href="/" className="group p-8 bg-white rounded-sm border border-transparent hover:border-[var(--primary-green)] hover:shadow-md transition-all duration-300 h-full flex flex-col justify-start text-left">
                                <h4 className="font-bold mb-3 text-lg text-[#000000] group-hover:text-[var(--primary-green)] transition-colors" style={{ fontFamily: "var(--font-playfair)" }}>
                                    {topic.title}
                                </h4>
                                <p className="text-sm text-[#000000]/60 font-lato leading-relaxed">
                                    {topic.desc}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQSection />

            {/* Support CTA */}
            <section className="py-24 text-center px-6">
                <div className="max-w-7xl mx-auto bg-[#000000] text-white py-20 px-10 rounded-sm relative overflow-hidden shadow-2xl">
                    {/* Decor (Mentorship Colors) */}
                    <div className="absolute top-0 left-0 h-[6px] w-full bg-[var(--primary-green)]"></div>
                    <div className="absolute top-[6px] left-0 h-[6px] w-full bg-[var(--mentorship-green)]"></div>

                    <h2 className="text-4xl md:text-5xl mb-6 font-bold uppercase tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Still need help?</h2>
                    <p className="text-white/70 max-w-xl mx-auto mb-12 font-lato text-lg">
                        Our support team is available 24/7 to assist you with any technical issues or platform inquiries.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button className="bg-[var(--primary-green)] border border-transparent hover:border-[var(--red)] hover:bg-black text-white px-10 py-5 font-bold rounded-sm flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-xs font-mono">
                            <MessageCircle className="w-5 h-5" />
                            Start Live Chat
                        </button>
                        <button className="border border-white/30 hover:bg-white hover:text-[#000000] text-white px-10 py-5 font-bold rounded-sm flex items-center justify-center gap-3 transition-colors uppercase tracking-widest text-xs font-mono">
                            <Mail className="w-5 h-5" />
                            Email Support
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
