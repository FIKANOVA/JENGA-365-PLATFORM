"use client";

import { Mail, Download, Ban, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

export default function MenteeDetail({ id }: { id: string }) {
    return (
        <div className="flex-1 bg-background p-6 md:p-12 h-full overflow-y-auto w-full">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/dashboard/people" className="hover:text-primary">Mentees</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-bold">Aisha Kamau</span>
            </nav>

            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-kenya-green/10 flex items-center justify-center border border-kenya-green/20 rounded-lg">
                        <span className="text-kenya-green font-playfair text-2xl font-black">AK</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl md:text-4xl font-playfair font-black text-foreground">Aisha Kamau</h1>
                            <span className="bg-kenya-green/10 text-kenya-green text-[10px] font-mono px-2 py-0.5 border border-kenya-green/20 rounded">Mentee Role</span>
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className="w-2 h-2 bg-kenya-green rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-mono text-kenya-green uppercase tracking-wider">Active</span>
                            </div>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">Member Since: 14 Jan 2026 • ID: M-9920-KE</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <button className="px-4 py-2 border border-border/50 font-mono text-xs hover:bg-muted transition-colors flex items-center gap-2 rounded">
                        <Mail className="w-4 h-4" /> Message Mentee
                    </button>
                    <button className="px-4 py-2 border border-border/50 font-mono text-xs hover:bg-muted transition-colors flex items-center gap-2 rounded">
                        <Download className="w-4 h-4" /> Download Report
                    </button>
                    <button className="px-4 py-2 bg-kenya-red text-white font-mono text-xs hover:bg-kenya-red/90 transition-colors flex items-center gap-2 rounded">
                        <Ban className="w-4 h-4" /> Suspend
                    </button>
                </div>
            </header>

            {/* Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="p-6 border border-border/50 hover:border-kenya-red transition-all rounded-lg bg-card">
                    <p className="font-mono text-xs text-muted-foreground mb-4 uppercase">Sessions Completed</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-playfair font-black text-foreground">12</span>
                        <span className="text-kenya-green text-xs font-mono mb-1">+3 This Month</span>
                    </div>
                </div>
                <div className="p-6 border border-border/50 hover:border-kenya-red transition-all rounded-lg bg-card">
                    <p className="font-mono text-xs text-muted-foreground mb-4 uppercase">Pathway Progress</p>
                    <div className="flex items-center justify-between">
                        <span className="text-4xl font-playfair font-black text-foreground">67%</span>
                        <div className="w-10 h-10 rounded-full border-4 border-kenya-green border-r-transparent rotate-45"></div>
                    </div>
                </div>
                <div className="p-6 border border-border/50 hover:border-kenya-red transition-all rounded-lg bg-card">
                    <p className="font-mono text-xs text-muted-foreground mb-4 uppercase">Last Session (Days)</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-playfair font-black text-foreground">4</span>
                        <span className="bg-kenya-green text-white text-[10px] px-2 py-0.5 font-mono mb-1 rounded">On Track</span>
                    </div>
                </div>
                <div className="p-6 border border-border/50 hover:border-kenya-red transition-all rounded-lg bg-card">
                    <p className="font-mono text-xs text-muted-foreground mb-4 uppercase">Mentor Match Score</p>
                    <div className="flex items-end justify-between">
                        <span className="text-4xl font-playfair font-black text-foreground">91%</span>
                        <span className="text-muted-foreground text-[10px] font-mono mb-1 text-right leading-tight">Goals/Location<br />Avail</span>
                    </div>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Left Column (Main) */}
                <div className="xl:col-span-2 flex flex-col gap-12">
                    <section>
                        <h2 className="text-2xl font-playfair font-black mb-6 flex items-center gap-3 text-foreground">
                            Learning Pathway <span className="text-xs font-mono text-muted-foreground font-normal">Level 2 of 4</span>
                        </h2>
                        <div className="space-y-0 relative ml-4">
                            <div className="absolute left-3 top-2 bottom-2 w-px bg-border/50"></div>
                            
                            {/* Completed */}
                            <div className="relative pl-12 pb-8">
                                <div className="absolute left-0 top-1 w-6 h-6 bg-kenya-green rounded-full flex items-center justify-center z-10">
                                    <Check className="text-white w-4 h-4" />
                                </div>
                                <p className="font-mono text-[10px] text-kenya-green uppercase tracking-wider mb-1">Completed • 02 Feb</p>
                                <h3 className="font-bold text-lg mb-1 text-foreground">Financial Literacy Foundations</h3>
                                <p className="text-sm text-muted-foreground">Successfully completed the assessment with 94% score.</p>
                            </div>

                            {/* In Progress */}
                            <div className="relative pl-12 pb-8">
                                <div className="absolute left-0 top-1 w-6 h-6 border-2 border-primary bg-background rounded-full flex items-center justify-center z-10">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                </div>
                                <p className="font-mono text-[10px] text-primary uppercase tracking-wider mb-1">In Progress</p>
                                <h3 className="font-bold text-lg mb-2 text-foreground">Portfolio Management & Risk</h3>
                                <div className="w-full h-1.5 bg-muted rounded-full max-w-sm overflow-hidden">
                                    <div className="bg-primary h-full w-[40%]"></div>
                                </div>
                                <p className="text-[10px] font-mono mt-2 text-muted-foreground">Next Milestone: Risk Mitigation Strategy</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-playfair font-black text-foreground">Session History</h2>
                            <button className="bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-wider px-4 py-2 hover:bg-primary/90 transition-colors rounded">
                                + Log New Session
                            </button>
                        </div>
                        <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted border-b border-border/50">
                                    <tr>
                                        <th className="p-4 font-mono text-[10px] uppercase text-muted-foreground">Date</th>
                                        <th className="p-4 font-mono text-[10px] uppercase text-muted-foreground">Topic</th>
                                        <th className="p-4 font-mono text-[10px] uppercase text-muted-foreground">Outcome</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-mono text-muted-foreground">24 Mar</td>
                                        <td className="p-4 font-bold text-foreground">Q1 Planning</td>
                                        <td className="p-4 text-muted-foreground">Milestones defined</td>
                                    </tr>
                                    <tr className="hover:bg-muted/50 transition-colors">
                                        <td className="p-4 font-mono text-muted-foreground">17 Mar</td>
                                        <td className="p-4 font-bold text-foreground">Budgeting Basics</td>
                                        <td className="p-4 text-muted-foreground">Module passed</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Columns (Sidebars) */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="flex flex-col gap-8">
                        {/* Attendance */}
                        <section className="p-6 border border-border/50 rounded-lg bg-card">
                            <h3 className="font-mono text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Attendance Rate</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-playfair font-black text-kenya-green">92%</span>
                            </div>
                            <div className="flex items-end gap-1 h-12 mt-4">
                                <div className="flex-1 bg-kenya-green/20 h-[60%] rounded-t-sm"></div>
                                <div className="flex-1 bg-kenya-green/40 h-[80%] rounded-t-sm"></div>
                                <div className="flex-1 bg-kenya-green/60 h-[70%] rounded-t-sm"></div>
                                <div className="flex-1 bg-kenya-green/80 h-[90%] rounded-t-sm"></div>
                                <div className="flex-1 bg-kenya-green h-full rounded-t-sm"></div>
                            </div>
                        </section>

                        <section className="p-6 border border-border/50 rounded-lg bg-card">
                             <h3 className="font-mono text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">Mood Journal (7 Days)</h3>
                             <div className="grid grid-cols-7 gap-2 mb-4">
                                 {['bg-kenya-green/10', 'bg-kenya-green/10', 'bg-primary/10', 'bg-kenya-green/10', 'bg-kenya-green/10', 'bg-kenya-green/10', 'bg-kenya-green/10'].map((bg, i) => (
                                    <div key={i} className={`aspect-square ${bg} flex items-center justify-center text-lg rounded`}>
                                        {i === 2 ? '😐' : '😊'}
                                    </div>
                                 ))}
                             </div>
                             <div className="pt-3 border-t border-border/50 text-center">
                                 <span className="text-xs font-bold text-foreground">Generally Positive</span>
                             </div>
                        </section>
                     </div>

                     <div className="flex flex-col gap-8">
                        <section className="p-6 bg-kenya-green/5 border border-kenya-green/20 rounded-lg">
                            <h3 className="font-mono text-[10px] text-kenya-green mb-4 uppercase tracking-wider font-bold">CSR/ESG Metric Impact</h3>
                            <p className="text-xs mb-4 leading-relaxed text-foreground">
                                Aisha's progress contributes to the <b className="font-bold">Corporate Social Responsibility Goal: Economic Empowerment</b>.
                            </p>
                        </section>

                        <section className="p-6 border border-border/50 rounded-lg bg-card">
                            <h3 className="font-mono text-[10px] text-muted-foreground mb-4 uppercase tracking-wider">Flags & Alerts</h3>
                            <div className="flex items-center gap-3 text-kenya-green">
                                <Check className="w-5 h-5" />
                                <span className="text-xs font-bold">No active flags</span>
                            </div>
                        </section>
                     </div>
                </div>
            </div>
        </div>
    );
}
