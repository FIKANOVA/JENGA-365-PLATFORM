import { redirect } from "next/navigation";

// CLAUDE.md §10.5 / §11: in-app partner reporting is deprecated.
// ESG reporting lives in the Looker Studio iframe on /dashboard/partner.
export default function PartnerReportPage() {
    redirect("/dashboard/partner");
}
