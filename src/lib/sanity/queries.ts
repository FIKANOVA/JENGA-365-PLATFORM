import { groq } from "next-sanity";
import { client } from "./client";

// ── Articles ────────────────────────────────────────────────
export const articlesQuery = groq`*[_type == "article" && publishedAt < now()] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  category,
  isFeatured,
  mainImage { asset->{ _id, url } },
  author->{ name, image { asset->{ url } } },
  publishedAt,
  "readTime": round(length(pt::text(body)) / 200)
}`;

export const articleBySlugQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  category,
  mainImage { asset->{ _id, url } },
  author->{ name, role, image { asset->{ url } } },
  publishedAt,
  body,
  "readTime": round(length(pt::text(body)) / 200)
}`;

export const relatedArticlesQuery = groq`*[_type == "article" && slug.current != $slug && publishedAt < now()] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  mainImage { asset->{ _id, url } },
  publishedAt
}`;

export async function fetchArticles() {
    return await client.fetch(articlesQuery);
}

export async function fetchArticleBySlug(slug: string) {
    return await client.fetch(articleBySlugQuery, { slug });
}

export async function fetchRelatedArticles(slug: string) {
    return await client.fetch(relatedArticlesQuery, { slug });
}

// ── Events ──────────────────────────────────────────────────
export const eventsQuery = groq`*[_type == "event" && date >= now()] | order(date asc) {
  _id,
  title,
  type,
  date,
  location,
  isOnline,
  capacity,
  "image": image.asset->url,
  description
}`;

export async function fetchEvents() {
    return await client.fetch(eventsQuery);
}

// ── Partners ─────────────────────────────────────────────────
export const partnersQuery = groq`*[_type == "partner"] {
  _id,
  name,
  logo,
  website,
  tier
}`;

export async function fetchPartners() {
    return await client.fetch(partnersQuery);
}

// ── Impact Stats ─────────────────────────────────────────────
export const impactStatsQuery = groq`*[_type == "impactStats"][0] {
  activeMentors,
  youthImpacted,
  mentorshipHours,
  clinicsHeld,
  treesPlanted,
  activePartnerships,
  countriesReached
}`;

export async function fetchImpactStats() {
    try {
        return await client.fetch(impactStatsQuery);
    } catch {
        return null;
    }
}

// ── Products ─────────────────────────────────────────────────
export const productsQuery = groq`*[_type == "product"] | order(title asc) {
  _id,
  title,
  slug,
  category,
  price,
  discountPrice,
  stockStatus,
  mainImage { asset->{ _id, url } },
  description
}`;

export async function fetchProducts() {
    return await client.fetch(productsQuery);
}

// ── Resources (Downloads) ─────────────────────────────────────
export const resourcesQuery = groq`*[_type == "resource"] | order(_createdAt desc) {
  _id,
  title,
  type,
  category,
  description,
  locked,
  "fileUrl": file.asset->url,
  "fileSize": file.asset->size,
  "format": file.asset->extension,
  externalLink
}`;

export async function fetchResources() {
    return await client.fetch(resourcesQuery);
}

// ── Videos ───────────────────────────────────────────────────
export const videosQuery = groq`*[_type == "video"] | order(publishedAt desc) {
  _id,
  title,
  description,
  category,
  videoUrl,
  "thumbnail": thumbnail.asset->url,
  duration,
  isFeatured,
  publishedAt
}`;

export async function fetchVideos() {
    try {
        return await client.fetch(videosQuery);
    } catch {
        return [];
    }
}

// ── Voices ───────────────────────────────────────────────────
export const voicesQuery = groq`*[_type == "voices"] | order(date desc) {
  _id,
  title,
  type,
  description,
  host,
  xUrl,
  date,
  duration,
  listeners,
  recorded,
  posts,
  impressions
}`;

export async function fetchVoices() {
    try {
        return await client.fetch(voicesQuery);
    } catch {
        return [];
    }
}
