import { fetchArticles } from "@/lib/sanity/queries";
import ArticlesPageClient from "./ArticlesPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResourcesArticlesPage() {
    const articles = await fetchArticles().catch(() => []);
    return <ArticlesPageClient initialArticles={articles} />;
}
