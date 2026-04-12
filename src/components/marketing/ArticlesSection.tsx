import { urlFor } from "@/lib/sanity/client";
import Link from "next/link";

export default function ArticlesSection({ articles }: { articles: any[] }) {
    return (
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.map((article) => (
                <Link href={`/resources/articles/${article.slug.current}`} key={article._id} className="group">
                    <div className="aspect-[16/10] bg-muted rounded-xl overflow-hidden mb-4 relative">
                        {article.mainImage && (
                            <img
                                src={urlFor(article.mainImage).width(600).url()}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground uppercase tracking-widest">
                        <span>{article.readTime} min read</span>
                        <span>•</span>
                        <span>{article.author?.name}</span>
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                    </h3>
                </Link>
            ))}
        </div>
    );
}
