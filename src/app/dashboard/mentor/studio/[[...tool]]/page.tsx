import { Studio } from "@/components/sanity/Studio";

export const dynamic = "force-static";

export default function MentorStudioPage() {
    return (
        <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
            <Studio basePath="/dashboard/mentor/studio" />
        </div>
    );
}
