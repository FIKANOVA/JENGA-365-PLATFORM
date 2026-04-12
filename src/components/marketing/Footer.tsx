"use client";

import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function Footer() {
    return (
        <footer className="bg-foreground py-32 border-t border-background/5 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-32">
                    {/* Brand Info */}
                    <div className="md:col-span-5 space-y-12">
                        <Link href="/" className="inline-block group">
                            <Logo variant="symbol" showText theme="dark" height={40} />
                        </Link>
                        <div className="space-y-6 max-w-sm">
                            <p className="font-serif font-bold text-4xl text-background leading-none uppercase tracking-tighter">
                                Building <br />
                                <span className="text-primary group-hover:text-secondary transition-colors duration-500">Growth.</span>
                            </p>
                            <p className="font-sans font-light text-lg text-background/40 leading-relaxed border-l-2 border-background/5 pl-8 py-2">
                                Bridging potential and performance through premium mentorship and strategic networking. Est. 2024.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {['linkedin', 'alternate_email', 'public'].map((icon, i) => (
                                <a key={i} href="/" className="w-14 h-14 bg-background/[0.03] border border-background/5 flex items-center justify-center text-background/20 hover:bg-black hover:text-white hover:border-secondary transition-all duration-700 group">
                                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-2 space-y-10">
                        <h4 className="section-label">Resources</h4>
                        <ul className="space-y-6">
                            {['Mentors', 'Mentees', 'Resources', 'About Us'].map((item) => (
                                <li key={item}>
                                    <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.4em] text-background/30 hover:text-background transition-all">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2 space-y-10">
                        <h4 className="section-label">Connect</h4>
                        <ul className="space-y-6">
                            {['Upcoming Events', 'Impact Stories', 'Rugby Base', 'Global Store'].map((item) => (
                                <li key={item}>
                                    <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.4em] text-background/30 hover:text-background transition-all">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-10">
                        <div className="space-y-4">
                            <h4 className="section-label">Jenga Journal</h4>
                            <p className="font-sans font-light text-background/40 leading-relaxed text-sm">Join the selected group of 2,400+ members in our monthly growth circle.</p>
                        </div>
                        <div className="space-y-8">
                            <input 
                                type="email" 
                                placeholder="COMMUNICATIONS EMAIL" 
                                className="bg-transparent text-[10px] font-mono text-background placeholder:text-background/10 focus:outline-none border-b border-background/10 pb-4 w-full uppercase tracking-[0.4em] focus:border-primary transition-colors"
                            />
                            <button className="flex items-center gap-4 text-background font-mono text-[10px] uppercase tracking-[0.4em] hover:text-secondary transition-all font-bold group">
                                Subscribe Protocol
                                <span className="w-8 h-px bg-background/20 group-hover:bg-secondary transition-all" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-16 border-t border-background/5 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-background/10 font-bold">
                            © 2024 Jenga365. Protocol v1.0
                        </span>
                        <div className="flex items-center gap-12 font-mono text-[9px] uppercase tracking-[0.4em] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-primary-container)] shadow-[0_0_8px_var(--md-primary-container)] animate-pulse" />
                            <span className="text-background/80">Jenga365 Live</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-12 font-mono text-[9px] uppercase tracking-[0.4em] font-bold">
                        <Link href="/privacy" className="text-background/10 hover:text-secondary transition-all underline decoration-transparent hover:decoration-secondary">Privacy</Link>
                        <Link href="/terms" className="text-background/10 hover:text-secondary transition-all underline decoration-transparent hover:decoration-secondary">Terms</Link>
                        <span className="text-background/40 font-serif italic">Nairobi, Kenya</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
