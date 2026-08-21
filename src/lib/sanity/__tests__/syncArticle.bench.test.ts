import { describe, it, expect, vi } from 'vitest';

// Mock server-only to allow running in vitest
vi.mock('server-only', () => ({}));

import { publishArticleToSanity } from '../syncArticle';
import { db } from '@/lib/db';
import { sanityWriteClient } from '../writeClient';
import * as ensureAuthorMod from '../ensureAuthor';

// Mock dependencies
vi.mock('@/lib/db', () => {
    return {
        db: {
            query: {
                articles: {
                    findFirst: vi.fn(),
                },
                users: {
                    findFirst: vi.fn(),
                },
            },
            select: vi.fn().mockReturnThis(),
            from: vi.fn().mockReturnThis(),
            where: vi.fn(),
            update: vi.fn().mockReturnThis(),
            set: vi.fn().mockReturnThis(),
        },
    };
});

vi.mock('../writeClient', () => {
    return {
        sanityWriteClient: {
            createOrReplace: vi.fn(),
            delete: vi.fn(),
            createIfNotExists: vi.fn(),
            patch: vi.fn().mockReturnValue({ set: vi.fn().mockReturnThis(), commit: vi.fn() }),
        },
    };
});

// Create a spy for ensureAuthorDoc
const ensureAuthorDocSpy = vi.spyOn(ensureAuthorMod, 'ensureAuthorDoc');

describe('publishArticleToSanity performance benchmark', () => {
    it('should measure time taken for multiple co-authors', async () => {
        // Setup mock data
        const articleId = 'test-article-123';
        const authorId = 'test-author-123';

        // Let's test with 50 co-authors to make the N+1 issue obvious
        const coAuthorIds = Array.from({ length: 50 }, (_, i) => `co-author-${i}`);

        const mockArticle = {
            id: articleId,
            authorId: authorId,
            title: 'Test Article',
            slug: 'test-article',
            excerpt: 'Test excerpt',
            bodyPortableText: [],
            category: 'MENTORSHIP',
            tags: [],
            publishedAt: new Date(),
            isFeatured: false,
            coverImageUrl: null,
            coverImageAlt: null,
            coAuthorIds: coAuthorIds,
            sanityDocId: null,
        };

        const mockAuthor = {
            id: authorId,
            name: 'Main Author',
            email: 'author@test.com',
            metadata: null,
        };

        const mockCoAuthorRows = coAuthorIds.map(id => ({
            id,
            name: `Co Author ${id}`,
            email: `${id}@test.com`,
            metadata: null,
        }));

        vi.mocked(db.query.articles.findFirst).mockResolvedValue(mockArticle as any);
        vi.mocked(db.query.users.findFirst).mockResolvedValue(mockAuthor as any);
        vi.mocked((db as any).where).mockResolvedValue(mockCoAuthorRows as any);

        // Add artificial delay to ensureAuthorDoc to simulate network latency
        ensureAuthorDocSpy.mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 10)); // 10ms per call
            return;
        });

        const startTime = performance.now();

        await publishArticleToSanity(articleId);

        const endTime = performance.now();
        const duration = endTime - startTime;

        console.log(`Time taken with ${coAuthorIds.length} co-authors: ${duration.toFixed(2)}ms`);

        // Before optimization, 50 co-authors * 10ms = ~500ms + 1 author * 10ms = ~510ms
        // After optimization, all co-authors should run concurrently, taking ~10ms for all of them
        // Total time should be ~20ms
    });
});