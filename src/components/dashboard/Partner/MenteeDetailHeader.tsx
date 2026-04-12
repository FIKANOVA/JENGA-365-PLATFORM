"use client"

import { Mail, Download, Lock } from "lucide-react";

interface MenteeDetailHeaderProps {
    mentee: any;
}

export default function MenteeDetailHeader({ mentee }: MenteeDetailHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#F0FFF0] text-[#006600] flex items-center justify-center font-playfair font-black text-2xl">
                    {mentee.name?.substring(0, 2).toUpperCase() || "AI"}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                            Dashboard → Employee Mentees
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="font-playfair font-black text-3xl text-foreground">
                            {mentee.name || "Aisha Kamau"}
                        </h1>
                        <span className="bg-[#F0FFF0] text-[#006600] px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-tighter">
                            Mentee
                        </span>
                        <div className="w-2 h-2 rounded-full bg-[#006600] animate-pulse-green" title="Active" />
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">
                        Joined {new Date(mentee.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 border border-input text-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:border-primary transition-colors">
                    <Mail className="w-4 h-4" /> Message Mentee
                </button>
                <button className="flex items-center gap-2 border border-input text-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:border-primary transition-colors">
                    <Download className="w-4 h-4" /> Download Report
                </button>
                <button className="flex items-center gap-2 border border-primary text-primary px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    <Lock className="w-4 h-4" /> Suspend Mentee
                </button>
            </div>
        </header>
    );
}
