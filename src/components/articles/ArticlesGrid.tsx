"use client";

import ArticleCard from "./ArticleCard";

interface ArticlesGridProps {
    readonly articles: any[]; // Using any for now to match mockData flexibility
}

export default function ArticlesGrid({ articles }: ArticlesGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
                <ArticleCard
                    key={article._id ?? article.id}
                    title={article.title}
                    excerpt={article.excerpt ?? ""}
                    author={article.author?.name ?? article.author ?? "Jenga365 Team"}
                    category={article.category ?? "GENERAL"}
                    date={article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (article.date ?? "")}
                    image={article.mainImage?.asset?.url ?? article.image ?? ""}
                    readTime={article.readTime ? `${article.readTime} min read` : "5 min read"}
                    slug={article.slug?.current ?? article.slug ?? article.id ?? ""}
                />
            ))}
        </div>
    );
}
