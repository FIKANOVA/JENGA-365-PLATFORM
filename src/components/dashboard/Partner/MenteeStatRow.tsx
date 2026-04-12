"use client"

import { formatDistanceToNow } from "date-fns";

interface Props {
    sessionsCount: number;
    progress: number;
    lastSessionDate?: Date;
}

export default function MenteeStatRow({ sessionsCount, progress, lastSessionDate }: Props) {
    const daysSinceLastSession = lastSessionDate
        ? Math.floor((new Date().getTime() - new Date(lastSessionDate).getTime()) / (1000 * 3600 * 24))
        : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                label="Sessions Completed"
                value={sessionsCount.toString()}
                delta="+3 this month"
                deltaColor="text-[#006600]"
            />
            <StatCard
                label="Pathway Progress"
                value={`${progress}%`}
                delta="+12% since last month"
                deltaColor="text-[#006600]"
                suffix={<div className="w-8 h-8 rounded-full border-2 border-[#006600] border-t-transparent animate-spin ml-2" />}
            />
            <StatCard
                label="Days Since Last Session"
                value={daysSinceLastSession !== null ? daysSinceLastSession.toString() : "-"}
                delta={daysSinceLastSession !== null && daysSinceLastSession > 14 ? "Overdue" : "On track"}
                deltaColor={daysSinceLastSession !== null && daysSinceLastSession > 14 ? "text-[#BB0000]" : "text-[#006600]"}
            />
            <StatCard
                label="Mentor Match Score"
                value="91%"
                delta="Goals · Location · Availability"
                deltaColor="text-muted-foreground"
                valueColor="text-[#BB0000]"
            />
        </div>
    );
}

function StatCard({ label, value, delta, deltaColor, suffix, valueColor = "text-foreground" }: any) {
    return (
        <div className="jenga-card p-6 flex flex-col justify-between">
            <span className="section-label mb-4">{label}</span>
            <div className="flex items-baseline gap-2">
                <h3 className={`font-playfair font-black text-4xl ${valueColor}`}>{value}</h3>
                {suffix}
            </div>
            <p className={`font-mono text-[10px] uppercase tracking-wider mt-4 ${deltaColor}`}>
                {delta}
            </p>
        </div>
    );
}
