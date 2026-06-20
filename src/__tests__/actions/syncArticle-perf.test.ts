import { describe, it, expect, vi } from "vitest";
import { publishArticleToSanity } from "@/lib/sanity/syncArticle";
import { db } from "@/lib/db";
import { ensureAuthorDoc } from "@/lib/sanity/ensureAuthor";
import { sanityWriteClient } from "@/lib/sanity/writeClient";

// Mock dependencies
vi.mock("@/lib/db", () => ({
    db: {
        query: {
            articles: {
                findFirst: vi.fn(),
            },
            users: {
                findFirst: vi.fn(),
            },
        },
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
    },
}));

vi.mock("@/lib/sanity/ensureAuthor", () => ({
    ensureAuthorDoc: vi.fn(),
    authorDocIdFor: vi.fn((id) => `author-${id}`),
}));

vi.mock("@/lib/sanity/writeClient", () => ({
    sanityWriteClient: {
        createOrReplace: vi.fn(),
    },
}));

describe("publishArticleToSanity performance", () => {
    it("should benchmark co-author synchronization", async () => {
        const articleId = "article-123";
        const authorId = "author-1";
        const coAuthorIds = Array.from({ length: 10 }, (_, i) => `co-author-${i}`);

        // Setup mocks
        vi.mocked(db.query.articles.findFirst).mockResolvedValue({
            id: articleId,
            authorId: authorId,
            coAuthorIds: coAuthorIds,
            title: "Test Article",
            slug: "test-article",
            bodyPortableText: [],
            sanityDocId: "sanity-123",
        } as any);

        vi.mocked(db.query.users.findFirst).mockResolvedValue({
            id: authorId,
            name: "Main Author",
            email: "main@example.com",
            metadata: {},
        } as any);

        const mockCoAuthorRows = coAuthorIds.map((id, i) => ({
            id,
            name: `Co-Author ${i}`,
            email: `co${i}@example.com`,
            metadata: {},
        }));

        vi.mocked(db.select).mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue(mockCoAuthorRows),
            }),
        } as any);

        // Add 50ms delay to ensureAuthorDoc to simulate network
        vi.mocked(ensureAuthorDoc).mockImplementation(async () => {
            return new Promise((resolve) => setTimeout(resolve, 50));
        });

        vi.mocked(sanityWriteClient.createOrReplace).mockResolvedValue({} as any);

        const start = performance.now();
        await publishArticleToSanity(articleId);
        const end = performance.now();

        const duration = end - start;
        console.log(`Publishing article with ${coAuthorIds.length} co-authors took ${duration.toFixed(2)}ms`);

        // Assert ensuring all docs were called
        expect(ensureAuthorDoc).toHaveBeenCalledTimes(1 + coAuthorIds.length);

        // In original code, it takes ~500ms for 10 co-authors. In optimized, it will take ~50ms.
        // We log it so we can see it in vitest.
    });
});
