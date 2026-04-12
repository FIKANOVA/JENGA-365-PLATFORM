"use client";

import ImpactReportPreview from "@/components/reports/ImpactReportPreview";

// Sample data — in production this would come from the database/API
const SAMPLE_REPORT = {
    companyName: "Acme Corporation",
    period: "Q1 2024",
    generatedDate: "MAR 05, 2024",
    stats: {
        totalInvestment: "KES 250,000",
        employeeMentors: "12",
        volunteerHours: "480 hrs",
        sponsorshipROI: "4.2x",
    },
    mentorshipMetrics: [
        { metric: "Active Mentors", value: "12", change: "+3 from Q4", status: "On Track" as const },
        { metric: "Mentees Reached", value: "48", change: "+12 from Q4", status: "On Track" as const },
        { metric: "Sessions Completed", value: "156", change: "+45 from Q4", status: "On Track" as const },
        { metric: "Avg Session Rating", value: "4.6/5", change: "-0.1", status: "Needs Attention" as const },
        { metric: "Completion Rate", value: "82%", change: "+5%", status: "On Track" as const },
    ],
    esg: {
        environmental: 72,
        social: 88,
        governance: 78,
    },
    events: [
        { name: "Leadership Webinar Series", date: "Jan 15, 2024", type: "Webinar", attendees: 120, cost: "KES 45,000" },
        { name: "Nairobi Rugby Clinic", date: "Feb 10, 2024", type: "Clinic", attendees: 65, cost: "KES 85,000" },
        { name: "Career Pathways Workshop", date: "Mar 01, 2024", type: "Workshop", attendees: 40, cost: "KES 30,000" },
    ],
};

export default function ImpactReportPage() {
    return <ImpactReportPreview {...SAMPLE_REPORT} />;
}
