import { groq } from "next-sanity";
import { client } from "./client";

// ── Site Settings (singleton) ───────────────────────────────
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0] {
  landingHeroImage { asset->{ _id, url }, alt, hotspot, crop },
  aboutHeroImage { asset->{ _id, url }, alt, hotspot, crop },
  authImage { asset->{ _id, url }, alt, hotspot, crop },
  openGraphImage { asset->{ _id, url }, hotspot, crop },
  aboutOpenGraphImage { asset->{ _id, url }, hotspot, crop },
  sweatEquityImage { asset->{ _id, url }, hotspot, crop },
  landingHero,
  featuredVideoHeading,
  lumaCalendarIframe,
  featuredVideo->{
    _id,
    title,
    description,
    videoUrl,
    duration,
    thumbnail { asset->{ _id, url } }
  },
  impactTestimonials[]{ quote, name, role, handle, source, rating, sourceUrl, avatar { asset->{ _id, url } } },
  environmentalStats[]{ value, label, description },
  historyTimeline[]{ title, date, content },
  faqItems[]{ question, answer }
}`;

export async function fetchSiteSettings() {
    try {
        return await client.fetch(siteSettingsQuery);
    } catch {
        return null;
    }
}

// ── Team Officials ──────────────────────────────────────────
export const teamOfficialsQuery = groq`*[_type == "teamOfficial" && coalesce(isPublished, true) == true] | order(order asc, name asc) {
  _id,
  name,
  slug,
  role,
  bio,
  linkedinUrl,
  order,
  headshot { asset->{ _id, url }, alt, hotspot, crop }
}`;

export async function fetchTeamOfficials() {
    try {
        return await client.fetch(teamOfficialsQuery);
    } catch {
        return [];
    }
}

// ── Articles ────────────────────────────────────────────────
export const articlesQuery = groq`*[_type == "article" && (status == "published" || publishedAt <= now())] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  slug,
  excerpt,
  category,
  isFeatured,
  mainImage { asset->{ _id, url } },
  author->{ name, image { asset->{ url } } },
  publishedAt,
  _createdAt,
  "readTime": round(length(pt::text(body)) / 200)
}`;

export const articleBySlugQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  category,
  tags,
  mainImage { asset->{ _id, url }, alt },
  author->{ name, role, bio, image { asset->{ url } } },
  coAuthors[]->{ name, role, image { asset->{ url } } },
  publishedAt,
  _createdAt,
  body[]{
    ...,
    _type == "image" => { ..., "url": asset->url }
  },
  "readTime": round(length(pt::text(body)) / 200)
}`;

export const relatedArticlesQuery = groq`*[_type == "article" && slug.current != $slug && (status == "published" || publishedAt <= now())] | order(coalesce(publishedAt, _createdAt) desc)[0...3] {
  _id,
  title,
  slug,
  mainImage { asset->{ _id, url } },
  publishedAt,
  _createdAt
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
export const eventsQuery = groq`*[_type == "event"] | order(date asc) {
  _id,
  title,
  "type": eventType,
  date,
  location,
  isOnline,
  capacity,
  registrationLink,
  "image": mainImage.asset->url,
  "galleryCount": count(gallery),
  "description": coalesce(pt::text(description), ""),
  lumaEventIframe
}`;

export async function fetchEvents() {
    return await client.fetch(eventsQuery);
}

export const eventByIdQuery = groq`*[_type == "event" && _id == $id][0] {
  _id,
  title,
  "type": eventType,
  date,
  location,
  isOnline,
  capacity,
  registrationLink,
  mainImage { asset->{ _id, url }, hotspot, crop },
  description,
  gallery[] {
    _key,
    asset->{ _id, url },
    alt,
    caption,
    hotspot,
    crop
  }
}`;

/**
 * Fetch a Sanity event by its document `_id`. Use this with the `sanity_doc_id`
 * stored on the Neon `events` table to hydrate event detail pages with media.
 */
export async function fetchEventBySanityId(sanityDocId: string) {
    if (!sanityDocId) return null;
    try {
        return await client.fetch(eventByIdQuery, { id: sanityDocId });
    } catch {
        return null;
    }
}

// ── Partners ─────────────────────────────────────────────────
export const partnersQuery = groq`*[_type == "partner"] {
  _id,
  name,
  logo { asset->{ _id, url } },
  website,
  tier
}`;

export async function fetchPartners() {
    return await client.fetch(partnersQuery);
}

// ── Help Center ──────────────────────────────────────────────
// Audience filtering happens server-side in code, not in GROQ, because the
// access tokens (guest/mentee/mentor/corporate/ngo/content/all) need to be
// resolved against Better Auth session + moderationScope. See lib/auth/helpAccess.ts.
export const userManualsQuery = groq`*[_type == "userManual"] | order(order asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  iconName,
  badge,
  allowedRoles,
  order
}`;

export const userManualBySlugQuery = groq`*[_type == "userManual" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  iconName,
  badge,
  body,
  allowedRoles
}`;

export const helpTopicsQuery = groq`*[_type == "helpTopic"] | order(order asc, title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  allowedRoles,
  order
}`;

export async function fetchUserManuals() {
    try {
        return await client.fetch(userManualsQuery);
    } catch {
        return [];
    }
}

export async function fetchUserManualBySlug(slug: string) {
    if (!slug) return null;
    try {
        return await client.fetch(userManualBySlugQuery, { slug });
    } catch {
        return null;
    }
}

export async function fetchHelpTopics() {
    try {
        return await client.fetch(helpTopicsQuery);
    } catch {
        return [];
    }
}

// ── Products ─────────────────────────────────────────────────
// Used by the moderator inventory page to mirror the Sanity catalog.
// Stock counts live in Neon (merchandise table), so they are not selected here.
export const productsQuery = groq`*[_type == "product"] | order(title asc) {
  _id,
  title,
  slug,
  category,
  price,
  discountPrice,
  mainImage { asset->{ _id, url } },
  description
}`;

export async function fetchProducts() {
    return await client.fetch(productsQuery);
}

// ── Resources (Downloads) ─────────────────────────────────────
export const resourcesQuery = groq`*[_type == "resource"] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "type": coalesce(resourceType, type, "pdf"),
  category,
  description,
  "locked": coalesce(locked, false),
  "fileUrl": file.asset->url,
  "fileSize": file.asset->size,
  "format": coalesce(file.asset->extension, resourceType, "pdf"),
  "externalLink": coalesce(externalUrl, externalLink)
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
export const voicesQuery = groq`*[_type == "voices"] | order(coalesce(date, _createdAt) desc) {
  _id,
  title,
  type,
  description,
  host,
  authorRole,
  authorAvatar { asset->{ _id, url } },
  rating,
  url,
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

// ── Legal Pages ──────────────────────────────────────────────
export const legalPageBySlugQuery = groq`*[_type == "legalPage" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  lastUpdated,
  body
}`;

export async function fetchLegalPageBySlug(slug: string) {
    if (!slug) return null;
    try {
        return await client.fetch(legalPageBySlugQuery, { slug });
    } catch {
        return null;
    }
}
