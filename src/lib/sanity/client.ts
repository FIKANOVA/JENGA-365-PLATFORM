import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";


const mockClient = {
    fetch: async () => [],
    withConfig: () => mockClient,
};

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "juu4g4fy",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-04",
    useCdn: false, // Ensures real-time fresh content from Sanity Content Lake
});

// Write client for server-side mutations where write token is configured
export const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "juu4g4fy",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-04",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
    return builder.image(source);
}
