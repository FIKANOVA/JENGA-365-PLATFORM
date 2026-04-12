import { fetchVoices } from "@/lib/sanity/queries";
import VoicesPageClient from "./VoicesPageClient";

export const dynamic = "force-dynamic";

export default async function ResourcesVoicesPage() {
    const voices = await fetchVoices();
    return <VoicesPageClient initialVoices={voices} />;
}
