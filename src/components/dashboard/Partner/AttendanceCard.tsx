"use client"

interface Props {
    sessions: any[];
}

export default function AttendanceCard({ sessions }: Props) {
    return (
        <section className="jenga-card p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <span className="section-label mb-6">Attendance Rate</span>

            <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-playfair font-black text-4xl text-[#006600]">92%</h3>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-tighter">
                    Overall
                </p>
            </div>

            <p className="font-lato text-[13px] text-[#4A4A4A] mb-8">
                11 of 12 scheduled sessions attended
            </p>

            {/* Mini Bar Chart Mock */}
            <div className="flex items-end gap-2 h-16 mb-6">
                {[80, 100, 90, 100, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#006600]/10 rounded-t-sm relative group">
                        <div
                            className="bg-[#006600] absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-700"
                            style={{ height: `${h}%` }}
                        />
                        {i === 2 && (
                            <div className="absolute top-[-4px] left-0 right-0 h-1 bg-[#BB0000]" title="1 missed session" />
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#006600]" /> 11 Attended
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#BB0000]" /> 1 Missed
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#D0CBC0]" /> 0 Cancelled
                </div>
            </div>

            <button className="w-full mt-8 pt-4 border-t border-border font-mono text-[10px] text-[#BB0000] uppercase tracking-widest hover:underline text-left">
                View attendance history →
            </button>
        </section>
    );
}
