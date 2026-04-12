import { Studio } from "@/components/sanity/Studio";

export const dynamic = "force-static";

export default function ModeratorStudioPage() {
    return (
        <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
            <Studio basePath="/dashboard/moderator/studio" />
        </div>
    );
}
