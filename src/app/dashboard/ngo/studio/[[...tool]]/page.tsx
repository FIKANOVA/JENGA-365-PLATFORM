import { NgoStudio } from "@/components/sanity/NgoStudio";

export const dynamic = "force-static";

export default function NgoStudioPage() {
    return (
        <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
            <NgoStudio basePath="/dashboard/ngo/studio" />
        </div>
    );
}
