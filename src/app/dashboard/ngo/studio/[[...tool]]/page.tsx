import { redirect } from "next/navigation";

export default async function NgoStudioRedirectPage({
    params,
}: {
    params: Promise<{ tool?: string[] }>;
}) {
    const { tool } = await params;
    const suffix = tool && tool.length ? "/" + tool.join("/") : "";
    redirect("/studio" + suffix);
}
