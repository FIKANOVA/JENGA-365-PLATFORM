"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

export default function PendingApprovalClient({ role }: { role: string }) {
    return (
        <div className="min-h-screen bg-[#FBFBF9] flex flex-col font-sans">
            <header className="border-b border-[#E8E4DC] bg-white">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="group transition-transform hover:scale-105 active:scale-95">
                        <Logo variant="symbol" showText theme="premium" height={32} priority />
                    </Link>
                    <div className="flex items-center gap-6 font-mono text-[10px] font-black uppercase tracking-widest text-[#8A8A8A]">
                        <Link href="/" className="hover:text-[#1A1A1A]">Product</Link>
                        <Link href="/support" className="hover:text-[#1A1A1A]">Support</Link>
                        <span className="material-symbols-outlined text-[16px]">contrast</span>
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-6 py-16 flex flex-col items-center">
                <div className="max-w-xl w-full text-center space-y-10">

                    {/* Header Section */}
                    <div className="space-y-6 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#F7BC00] rounded-full flex items-center justify-center text-white shadow-lg mx-auto">
                            <Clock size={32} strokeWidth={2.5} />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-serif font-black text-[#1A1A1A]">Application Under Review</h1>
                            <p className="text-[#8A8A8A] font-body text-[15px] max-w-sm mx-auto leading-relaxed">
                                Your <span className="font-bold text-[#1A1A1A]">{role}</span> application is being reviewed by our team. You will be notified via email once a decision has been made.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/settings"
                            className="inline-block mt-4 px-6 py-3 border-2 border-[#E8E4DC] text-[#4A4A4A] font-mono text-[10px] uppercase font-black tracking-widest hover:border-[#BB0000] hover:text-[#BB0000] transition-colors"
                        >
                            VIEW SETTINGS
                        </Link>
                    </div>

                    <div className="space-y-6 pt-6">
                        {/* Profile Completeness Box */}
                        <div className="bg-white border border-[#E8E4DC] p-8 text-left shadow-sm flex items-center justify-between">
                            <div className="space-y-2 max-w-[60%]">
                                <h3 className="font-serif font-bold text-[#1A1A1A] text-lg">Profile Completeness</h3>
                                <p className="text-[#8A8A8A] font-body text-sm leading-relaxed">
                                    Your profile is almost complete. Please make sure all details are accurate.
                                </p>

                                <div className="mt-4 flex items-center gap-2 pt-4 border-t border-[#F5F5F3]">
                                    <ShieldCheck size={16} className="text-[#006600]" />
                                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#4A4A4A]">
                                        NDA Status <span className="text-[#006600]">Signed</span>
                                    </span>
                                </div>
                            </div>

                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        className="text-[#F5F5F3]"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="text-[#BB0000]"
                                        strokeDasharray="75, 100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-serif text-[#BB0000] font-bold text-sm">
                                    75%
                                </div>
                            </div>
                        </div>

                        {/* Checklist Box */}
                        <div className="bg-white border border-[#E8E4DC] p-8 text-left shadow-sm space-y-6">
                            <StatusItem icon={<Check size={16} />} title="Role Selection" status="Complete" type="completed" />
                            <StatusItem icon={<Check size={16} />} title="Commitment Stage" status="Complete" type="completed" />
                            <StatusItem icon={<Clock size={16} />} title="Manual Review" status="Current" type="active" />
                            <StatusItem icon={<div className="w-[16px] h-[16px] border-2 border-current rounded-sm opacity-50" />} title="Dashboard Access" status="Pending" type="pending" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusItem({ icon, title, status, type }: { icon: any, title: string, status: string, type: "completed" | "active" | "pending" }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0
                ${type === "completed"
                    ? "bg-[#006600]/10 text-[#006600]"
                    : type === "active"
                        ? "bg-[#F7BC00]/10 text-[#F7BC00]"
                        : "bg-[#F5F5F3] text-[#D0CBC0]"}`}>
                {icon}
            </div>
            <div className="flex items-center justify-between w-full border-b border-[#F5F5F3]/50 pb-2">
                <span className={`text-[13px] font-serif font-bold transition-colors ${type === "pending" ? "text-[#8A8A8A]" : "text-[#1A1A1A]"}`}>
                    {title}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${type === "completed" ? "text-[#006600]" :
                    type === "active" ? "text-[#F7BC00]" : "text-[#D0CBC0]"
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}
