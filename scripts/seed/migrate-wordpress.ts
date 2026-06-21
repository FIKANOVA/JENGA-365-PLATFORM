import { readFileSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../../src/lib/db/schema";
import { JSDOM } from "jsdom";
import { htmlToBlocks } from "@portabletext/block-tools";
import { createClient } from "@sanity/client";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not set — run with: npx dotenv -e .env -- npx tsx scripts/seed/migrate-wordpress.ts");
}

const db = drizzle(neon(DATABASE_URL), { schema });

// Sanity Write Client specifically for this script since server-only imports fail
const sanityWriteClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-03-04",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Mapping of WordPress categories to our schema categories
const categoryMap: Record<string, any> = {
    "Career & Life Skills": "Career",
    "Community & Culture": "Community",
    // default
    "default": "Mentorship"
};

// We create a generic schema definition just so block-tools can convert html to portable text blocks
const blockContentType = {
    type: 'array',
    of: [{ type: 'block' }]
};

async function run() {
    console.log("🌱 Starting WordPress Migration...");

    const xmlData = readFileSync('docs/jenga365.WordPress.2026-06-20 (1).xml', 'utf8');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const jsonObj = parser.parse(xmlData);

    const items = jsonObj.rss.channel.item;
    const posts = items.filter((item: any) => item['wp:post_type'] === 'post' && item['wp:status'] === 'publish');

    console.log(`Found ${posts.length} published posts to migrate.`);

    // 1. Get or create a system author for these migrated posts
    let authorId;
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length > 0) {
        authorId = existingUsers[0].id;
        console.log(`Using existing user ${existingUsers[0].email} as author.`);
    } else {
        const [newUser] = await db.insert(schema.users).values({
            email: "admin@jenga365.com",
            name: "Jenga365 Admin",
            role: "SuperAdmin"
        }).returning();
        authorId = newUser.id;
        console.log(`Created new system user admin@jenga365.com as author.`);
    }

    for (const post of posts) {
        const title = post.title;
        const slug = generateSlug(title) || `post-${post['wp:post_id']}`;
        const contentHtml = post['content:encoded'] || '';
        const excerpt = post['excerpt:encoded'] || contentHtml.substring(0, 150).replace(/<[^>]+>/g, '');
        const pubDate = new Date(post['wp:post_date']);

        // Handle categories and tags
        let category = "Mentorship";
        const tags: string[] = [];

        if (post.category) {
            const cats = Array.isArray(post.category) ? post.category : [post.category];
            for (const c of cats) {
                if (c['@_domain'] === 'category') {
                    const wpCat = c['#text'].replace('&amp;', '&');
                    category = categoryMap[wpCat] || "Mentorship";
                } else if (c['@_domain'] === 'post_tag') {
                    const tagText = c['#text'].replace('#', '');
                    tags.push(...tagText.split(' ').map((t: string) => t.replace('#', '')));
                }
            }
        }

        console.log(`Migrating post: "${title}"...`);

        // Convert HTML to Portable Text blocks
        let bodyPortableText: any[] = [];
        try {
            const jsdom = new JSDOM(contentHtml);
            bodyPortableText = htmlToBlocks(contentHtml, blockContentType, {
                parseHtml: (html) => jsdom.window.document.createRange().createContextualFragment(html),
            });
            // Give keys to blocks
            bodyPortableText = bodyPortableText.map((block) => ({
                ...block,
                _key: `block-${Math.random().toString(36).substring(7)}`,
            }));
        } catch(e) {
            console.error("Error converting HTML to blocks, falling back to simple text block");
            bodyPortableText = [
                {
                    _type: "block",
                    _key: `block-${Math.random().toString(36).substring(7)}`,
                    style: "normal",
                    children: [
                        {
                            _type: "span",
                            _key: `span-${Math.random().toString(36).substring(7)}`,
                            text: contentHtml.replace(/<[^>]+>/g, ' ')
                        }
                    ]
                }
            ];
        }

        // Create article record
        let article;
        try {
            const [newArticle] = await db.insert(schema.articles).values({
                title,
                slug,
                excerpt: excerpt,
                bodyPortableText,
                authorId,
                category: category as any,
                tags,
                status: "published",
                publishedAt: pubDate,
                lastEditedAt: pubDate
            }).returning();

            article = newArticle;
            console.log(`✓ Inserted into Neon: ${article.id}`);
        } catch (err: any) {
            const isDuplicate = err.code === '23505' || 
                                err.cause?.code === '23505' || 
                                err.message?.includes('unique constraint') || 
                                err.cause?.message?.includes('unique constraint');
            if (isDuplicate) {
                console.log(`⚠️ Post already exists in Neon: ${title} - fetching to sync to Sanity...`);
                const existing = await db.select().from(schema.articles).where(eq(schema.articles.slug, slug)).limit(1);
                if (existing.length > 0) {
                    article = existing[0];
                }
            } else {
                console.error(`❌ Error migrating post "${title}":`, err);
            }
        }

        // Publish article to sanity
        if (article) {
            try {
                if (!process.env.SANITY_API_TOKEN) {
                    console.log(`⚠️ SANITY_API_TOKEN not set, skipping sanity sync for ${article.id}`);
                } else {
                    const sanityId = `article-jenga-${article.id}`;
                    await sanityWriteClient.createOrReplace({
                        _id: sanityId,
                        _type: "article",
                        title: article.title,
                        slug: { _type: "slug", current: article.slug },
                        excerpt: article.excerpt ?? "",
                        body: bodyPortableText,
                        category: article.category ? article.category.toUpperCase() : "MENTORSHIP",
                        tags: article.tags ?? [],
                        publishedAt: (article.publishedAt ?? new Date()).toISOString(),
                        status: "published",
                        isFeatured: article.isFeatured ?? false,
                    });
                    console.log(`✓ Published to Sanity: ${article.id} (${sanityId})`);
                }
            } catch (sanityErr) {
                console.error(`❌ Error publishing to sanity for ${article.id}:`, sanityErr);
            }
        }
    }

    console.log("Migration finished.");
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal:", err);
        process.exit(1);
    });
