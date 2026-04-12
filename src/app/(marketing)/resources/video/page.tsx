import { fetchVideos } from "@/lib/sanity/queries";
import VideoPageClient from "./VideoPageClient";

export const dynamic = "force-dynamic";

export default async function ResourcesVideoPage() {
    const videos = await fetchVideos();
    return <VideoPageClient initialVideos={videos} />;
}
