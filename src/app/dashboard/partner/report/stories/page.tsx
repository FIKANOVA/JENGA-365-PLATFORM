"use client";

import ImpactReportPage2 from "@/components/reports/ImpactReportPage2";

const SAMPLE_PAGE2 = {
    companyName: "Acme Corporation",
    stories: [
        {
            name: "Wanjiku Mwangi",
            role: "Junior Software Developer — Mentee",
            quote: "The mentorship completely changed my career trajectory. I went from being stuck in a junior role to leading a team of 4 developers within 8 months.",
            mentorName: "John Kamau",
            sessions: 24,
            rating: "4.8/5",
            growth: "+35%",
        },
        {
            name: "Brian Ochieng",
            role: "Aspiring Data Analyst — Mentee",
            quote: "Having a mentor who understood my specific challenges as a Kenyan tech professional made all the difference. I now have the confidence and skills to pursue real opportunities.",
            mentorName: "Sarah Njeri",
            sessions: 18,
            rating: "4.9/5",
            growth: "+42%",
        },
    ],
    insights: [
        { title: "Community Building", description: "Cross-departmental mentoring fostered stronger team dynamics and knowledge sharing across the organization.", metric: "12 community events facilitated", accent: "#BB0000" },
        { title: "Knowledge Transfer", description: "Structured skill-share sessions documented institutional knowledge for future reference.", metric: "48 skill-share sessions recorded", accent: "#006600" },
        { title: "Career Advancement", description: "Mentees achieved measurable career progression through targeted development plans.", metric: "8 mentees promoted within programme period", accent: "#1A1A1A" },
    ],
    testimonial: {
        quote: "Partnering with Jenga365 has transformed our CSR strategy from a compliance exercise into a genuine engine of impact. Our employee mentors are more engaged than ever, and the ESG metrics speak for themselves.",
        attribution: "MARGARET WANJIKU",
        title: "— Head of CSR, Acme Corporation",
    },
    recommendations: [
        { title: "Increase Mentor Capacity", description: "Recruit 5 additional employee mentors to meet growing demand. Current mentor-to-mentee ratio of 1:4 should target 1:3 for optimal outcomes." },
        { title: "Launch Group Mentoring Sessions", description: "Introduce monthly group sessions to scale impact without increasing individual mentor workload. Focus on leadership and technical skills." },
        { title: "Expand SDG Alignment", description: "Target SDG 5 (Gender Equality) in Q2 by implementing a women-in-tech mentoring track, building on existing infrastructure." },
    ],
};

export default function ImpactReportPage2Route() {
    return <ImpactReportPage2 {...SAMPLE_PAGE2} />;
}
