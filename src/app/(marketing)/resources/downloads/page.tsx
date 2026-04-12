import { fetchResources } from "@/lib/sanity/queries";
import DownloadsPageClient from "./DownloadsPageClient";

export const dynamic = "force-dynamic";

export default async function ResourcesDownloadsPage() {
    const resources = await fetchResources().catch(() => []);
    return <DownloadsPageClient initialDownloads={resources} />;
}
