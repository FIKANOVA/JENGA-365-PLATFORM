import { Metadata } from "next";
import MenteeDetail from "@/components/dashboard/Mentor/MenteeDetail";

export const metadata: Metadata = {
    title: "Mentee Details | Jenga365",
    description: "Detailed view of Mentee.",
};

export default async function MenteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const p = await params;
    return <MenteeDetail id={p.id} />;
}
