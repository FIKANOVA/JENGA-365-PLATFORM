import { redirect } from "next/navigation";

// CLAUDE.md §10.5 / §11: in-app partner reporting is deprecated.
export default function PartnerReportStoriesPage() {
    redirect("/dashboard/partner");
}
